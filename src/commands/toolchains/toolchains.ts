import type { CFPackConfig } from "../../types/types";

import path, { resolve } from "node:path";
import { mkdir, rm, exists, cp } from "node:fs/promises";
import { BUILD_DIR, RESOURCE_DIR, TOOLCHAIN_DIR } from "./toolchain-constants";
import type { SysrootScaffoldConfig } from "../../types/tool-config";

async function outputDependencies(
  scafoldConfigs: Record<string, SysrootScaffoldConfig>
) {
  const outDir = resolve(BUILD_DIR, "dependencies/cpp");
  if (!exists(outDir)) await mkdir(outDir);

  const copyOperations = Object.entries(scafoldConfigs).map(
    async ([key, scafold]) => {
      const scafoldedToolchainDir = resolve(TOOLCHAIN_DIR, key);
      if (!(await exists(scafoldedToolchainDir))) {
        console.error("No DockerResource Resources available for: " + key);
        return;
      }

      const [os, arch] = key.split(".");
      if (!(os && arch)) {
        console.error(
          "Invalid DockerResource Identifier, expected (OS.ARCH) but got: " +
            key
        );
        return;
      }

      const toolchainOutDir = resolve(outDir, os, arch);
      if (!exists(toolchainOutDir)) await mkdir(toolchainOutDir);

      // 3. Perform the Recursive Copy
      console.log(`Copying ${key} to output...`);

      await cp(scafoldedToolchainDir, toolchainOutDir, {
        recursive: true,
        force: true, // Overwrite if exists
        preserveTimestamps: true,
      });
    }
  );

  await Promise.all(copyOperations);
  console.log("Dependencies Copied Successfully too: " + outDir);
}

export async function organiseToolchains(config: CFPackConfig) {
  await removeToolchains(config);
  const scafoldConfigs = config.sysrootScaffoldConfig;

  for (const [key, scafold] of Object.entries(scafoldConfigs)) {
    const scafoldedToolchainDir = resolve(TOOLCHAIN_DIR, key);

    if (!(await exists(scafoldedToolchainDir)))
      await mkdir(scafoldedToolchainDir);

    console.log(key);
    for (const rule of scafold.rules) {
      // 1. Resolve Root Paths
      const sourceRoot = resolve(RESOURCE_DIR, rule.from);
      const destRoot = resolve(scafoldedToolchainDir, rule.to);

      // 2. Determine Scan Scope
      // If specific includes are given, we only scan those. Otherwise, we scan everything.
      const patternsToScan = rule.include?.length ? rule.include : ["**/*"];

      for (const pattern of patternsToScan) {
        const glob = new Bun.Glob(pattern);

        // Scan for files (asynchronous iterator)
        for await (const file of glob.scan({
          cwd: sourceRoot,
          onlyFiles: true,
        })) {
          // 3. Check Excludes (Priority: Exclude overrides Include)
          // We create a temp Glob to check if this specific file matches any exclude pattern
          if (
            rule.exclude?.some((excludePattern) =>
              new Bun.Glob(excludePattern).match(file)
            )
          ) {
            continue;
          }

          // 4. Resolve Destination Path
          const originalFilename = path.basename(file);
          const parsed = path.parse(originalFilename); // { name: "clang-21", ext: ".exe", base: "clang-21.exe" }

          let targetFilename = originalFilename;

          if (rule.rename) {
            // Strategy A: Check for exact full match first (e.g., "script.js" -> "app.js")
            if (rule.rename[originalFilename]) {
              targetFilename = rule.rename[originalFilename];
            }
            // Strategy B: Check for name match without extension (e.g., "clang-21" -> "clang")
            else if (rule.rename[parsed.name]) {
              const newName = rule.rename[parsed.name];
              targetFilename = newName + parsed.ext; // <--- Re-attach the original extension (.exe)
            }
          }

          // const destPath = rule.flatten
          //   ? resolve(destRoot, targetFilename)
          //   : resolve(destRoot, path.dirname(file), targetFilename);

          // Calculate the specific sub-path relative to destRoot
          // (e.g., "lib/x86_64-linux-gnu/libc.so")
          const relativeDestPath = rule.flatten
            ? targetFilename
            : path.join(path.dirname(file), targetFilename);

          const destPath = resolve(destRoot, relativeDestPath);

          // 5. Perform the Copy
          const sourcePath = resolve(sourceRoot, file);

          // Ensure the specific destination folder exists
          await mkdir(path.dirname(destPath), { recursive: true });

          // // Use Bun's native high-performance file writer
          // await Bun.write(destPath, Bun.file(sourcePath));

          // --- SUBSTITUTION LOGIC START ---

          // Normalize slashes to forward slashes for consistent Key lookup
          // (Windows uses backslashes, but your config keys use forward slashes)
          const substitutionKey = relativeDestPath.replace(/\\/g, "/");

          if (rule.substitutions && rule.substitutions[substitutionKey]) {
            // Case A: Write the substituted content (fix for libc.so)
            // We write the string directly instead of copying the file
            await Bun.write(destPath, rule.substitutions[substitutionKey]);
          } else {
            // Case B: Standard File Copy
            await Bun.write(destPath, Bun.file(sourcePath));
          }
        }
      }
    }
  }

  await outputDependencies(config.sysrootScaffoldConfig);
}

export async function removeToolchains(config: CFPackConfig) {
  const scafoldConfigs = config.sysrootScaffoldConfig;

  for (const [key, scafold] of Object.entries(scafoldConfigs)) {
    const toolchainPath = resolve(TOOLCHAIN_DIR, key);

    if (await exists(toolchainPath))
      await rm(toolchainPath, { recursive: true, force: true });
  }

  const dependencies = resolve(BUILD_DIR, "dependencies");
  if (await exists(dependencies))
    await rm(dependencies, { recursive: true, force: true });
}
