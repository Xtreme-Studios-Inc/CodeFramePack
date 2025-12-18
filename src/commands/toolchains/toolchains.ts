import type { CFPackConfig } from "../../core/types";

import path, { resolve } from "node:path";
import {
  mkdir,
  rm,
  exists,
  cp,
  symlink,
  unlink,
  readlink,
  lstat,
  chmod,
} from "node:fs/promises";
import { BUILD_DIR, RESOURCE_DIR, TOOLCHAIN_DIR } from "./toolchain-constants";
import type { SysrootScaffoldConfig } from "../../core/types/tool.types";

async function outputDependencies(
  scafoldConfigs: Record<string, SysrootScaffoldConfig>
) {
  const depsDir = resolve(BUILD_DIR, "dependencies");
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

  // 3. SPAWN TAR COMMAND
  console.log("🗜️ Compressing to cpp.tar.gz...");

  const proc = Bun.spawn(["tar", "-czf", "cpp.tar.gz", "cpp"], {
    cwd: depsDir,
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await proc.exited;

  if (exitCode === 0) {
    console.log("✅ Compression Complete: dependencies/cpp.tar.gz");
  } else {
    console.error("❌ Compression Failed with code:", exitCode);
  }
}

export async function organiseSysroots(config: CFPackConfig) {
  await removeSysroots(config);
  const scafoldConfigs = config.sysrootScaffoldConfig;

  for (const [key, scafold] of Object.entries(scafoldConfigs)) {
    const scafoldedToolchainDir = resolve(TOOLCHAIN_DIR, key);

    if (!(await exists(scafoldedToolchainDir)))
      await mkdir(scafoldedToolchainDir);

    console.log(key);
    for (const rule of scafold.rules) {
      const sourceRoot = resolve(RESOURCE_DIR, rule.from);
      const destRoot = resolve(scafoldedToolchainDir, rule.to);

      // Determine Scan Scope
      const patternsToScan = rule.include?.length ? rule.include : ["**/*"];

      for (const pattern of patternsToScan) {
        const glob = new Bun.Glob(pattern);

        // Scan for files (asynchronous iterator)
        for await (const item of glob.scan({
          cwd: sourceRoot,
          onlyFiles: false,
        })) {
          // Perform the Copy
          const sourcePath = resolve(sourceRoot, item);
          // Check Source Stats (Use lstat to NOT follow symlinks)
          const stats = await lstat(sourcePath);

          if (stats.isDirectory()) continue;

          // Normalize the path to forward slashes
          const normalizedFile = item.replace(/\\/g, "/");

          // Check Excludes using the normalized path
          if (
            rule.exclude?.some((excludePattern) =>
              new Bun.Glob(excludePattern).match(normalizedFile)
            )
          ) {
            // console.log(`❌ Excluding: ${normalizedFile}`);
            continue;
          }

          // Resolve Destination Path
          const originalFilename = path.basename(item);
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

          // Calculate the specific sub-path relative to destRoot
          const relativeDestPath = rule.flatten
            ? targetFilename
            : path.join(path.dirname(item), targetFilename);

          const destPath = resolve(destRoot, relativeDestPath);

          // Ensure the specific destination folder exists
          await mkdir(path.dirname(destPath), { recursive: true });

          // 3. Handle Symlinks vs Regular Files
          if (stats.isSymbolicLink()) {
            console.log(`🔗 Linking: ${originalFilename}`);

            // 1. Read the existing target
            let linkTarget = await readlink(sourcePath);

            // If the target is an absolute path, make it relative
            if (path.isAbsolute(linkTarget)) {
              linkTarget = path.relative(path.dirname(sourcePath), linkTarget);
            }

            // Enforce Forward Slashes (Linux Compatibility)
            // Windows might give you "..\lib\foo", Linux needs "../lib/foo"
            linkTarget = linkTarget.replace(/\\/g, "/");

            // Clean up destination
            try {
              await unlink(destPath);
            } catch {}

            // 4. Create the cleaned-up link
            await symlink(linkTarget, destPath, "file");
          } else {
            // --- SUBSTITUTION LOGIC ---
            const substitutionKey = relativeDestPath.replace(/\\/g, "/");

            if (rule.substitutions && rule.substitutions[substitutionKey]) {
              await Bun.write(destPath, rule.substitutions[substitutionKey]);
            } else {
              // Standard File Copy
              await Bun.write(destPath, Bun.file(sourcePath));

              // Optional: Preserve executable permissions for binaries
              // (Bun.write/copyFile doesn't always preserve chmod perfectly across OS)
              if (stats.mode & 0o111) {
                // It's executable, ensure destination is too
                await chmod(destPath, stats.mode);
              }
            }
          }
        }
      }
    }
  }

  await outputDependencies(config.sysrootScaffoldConfig);
}

export async function removeSysroots(config: CFPackConfig) {
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
