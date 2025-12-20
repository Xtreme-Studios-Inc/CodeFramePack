import {
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  statSync,
} from "fs";
import { basename, dirname, join, resolve } from "path";
import { pathToFileURL } from "url";

import { run } from "../core/util";
import { SKIPPED, type BuildConfiguration, type Result } from "../core/types";
import { type BuildType, type Cmd } from "../core/types/package.types";
import { BOLD, GREEN, MAGENTA, RESET } from "../core/types/theme";
import { RegistryManager } from "../core/registry/registry-manager";
import type {
  CollectionBuildStatus,
  CompilationBuildStatus,
} from "../core/types/registry.types";
import { REGISTRY_PATH } from "../providers/package.provider";

let CWD: string;

const buildOrder = [
  "windows_x86_64",
  "windows_aarch64",
  "linux_x86_64",
  "linux_aarch64",
] as const;

export async function build(
  config: BuildConfiguration,
  registry: RegistryManager
) {
  const { info, build } = config;
  let dirty = false;

  if (build.type === "compilation") {
    const flatten = (c: Cmd) =>
      typeof c === "string" ? c.replace(/\s+/g, " ").trim() : c;

    for (const name of buildOrder) {
      const config = build[name];
      if (!config) {
        console.log("No " + name + " compilation configuration available.");
        continue;
      }

      console.log(`\n${BOLD}${GREEN}=== ${name} ===${RESET}`);

      const configureResult: Result = await run(
        flatten(config.configStep),
        `Configuring (${name})`,
        {
          cwd: CWD,
        }
      );

      let buildResult: Result = SKIPPED;
      let installResult: Result = SKIPPED;

      if (!configureResult.success) {
        console.error(configureResult.error);
      } else {
        buildResult = await run(config.buildStep, `Building (${name})`, {
          cwd: CWD,
        });
        installResult = await run(config.installStep, `Installing (${name})`, {
          cwd: CWD,
        });
      }

      // ✅ REGISTRY UPDATE: Capture state regardless of success/failure
      const status: CompilationBuildStatus = {
        type: "compilation",
        config: configureResult,
        build: buildResult,
        install: installResult,
        timestamp: Date.now(),
        version: info.version,
      };

      registry.updateStatus(info.name, name, status);
      dirty = true;

      if (installResult.success) {
        console.log(`✅ Done: ${name}`);
      }
    }
  } else if (build.type === "collection") {
    let collectionSuccess = true;
    let errorLog = "";

    // ✅ Iterate over each library path
    for (const [installPath, files] of Object.entries(build.libs)) {
      const destDir = join(installPath);
      if (!existsSync(destDir)) {
        mkdirSync(join(destDir), { recursive: true });
        console.log(`Created directory: ${destDir}`);
      }

      // Copy each file
      for (const file of files) {
        const srcPath = resolve(CWD, file);
        const fileName = basename(srcPath);
        const destPath = join(installPath, fileName);

        if (!existsSync(srcPath)) {
          console.warn(`⚠️ Source file missing: ${srcPath}`);
          collectionSuccess = false;
          errorLog += `Missing: ${srcPath}\n`;
          continue;
        }

        const st = lstatSync(srcPath);

        try {
          if (st.isDirectory()) {
            // Copy directory (recursive)
            if (!existsSync(destPath)) {
              mkdirSync(destPath, { recursive: true });
            }
            cpSync(srcPath, destPath, { recursive: true });
          } else {
            // Copy single file
            const destParent = dirname(destPath);

            if (!existsSync(destParent))
              mkdirSync(destParent, { recursive: true });

            copyFileSync(srcPath, destPath);
          }
        } catch (err: any) {
          console.error(`❌ Copy failed for ${srcPath} → ${destPath}:`, err);
          collectionSuccess = false;
          errorLog += `${err.message}\n`;
        }
      }
    }

    // ✅ REGISTRY UPDATE: Save collection status
    const status: CollectionBuildStatus = {
      type: "collection",
      install: {
        success: collectionSuccess,
        code: collectionSuccess ? 0 : 1,
        error: errorLog,
      },
      timestamp: Date.now(),
      version: info.version,
    };

    // We use "universal" as the target name for collections
    registry.updateStatus(info.name, "universal", status);
    dirty = true;
  }

  // ✅ SAVE TO DISK: Only once per library
  if (dirty) registry.save();

  console.log("\n🎉 All builds complete.");
}

// Single Action
export async function runPackageAction(
  action: string,
  cwd: string = process.cwd(),
  builds: BuildConfiguration,
  registry?: RegistryManager
) {
  CWD = cwd;

  const activeRegistry = registry ?? new RegistryManager(REGISTRY_PATH);

  if (action == "build") {
    await build(builds, activeRegistry);
  } else if (action == "clean") {
    const buildDir = join(cwd, builds.info.outDir);
    await run(`rm -rf ${buildDir}`);
    // Clean up registry
    if (activeRegistry.getRegistry().libraryStatus[builds.info.name]) {
      delete activeRegistry.getRegistry().libraryStatus[builds.info.name];
      activeRegistry.save();
      console.log(`Removed ${builds.info.name} from registry.`);
    }
  } else if (action == "help") {
    console.log(
      `${BOLD}${MAGENTA}build:${RESET} builds the project for all supported architectures \n${BOLD}${MAGENTA}clean:${RESET} deletes the build directory`
    );
  }
}

async function getModule(dirPath: string, file: string): Promise<any | null> {
  if (!statSync(dirPath).isDirectory()) return null;

  const tsPath = join(dirPath, ".codeframe", file);
  if (!existsSync(tsPath)) return null;

  return await import(pathToFileURL(tsPath).href);
}

// Multi Actions
export async function runPackageActions(action: string, libSources: string) {
  let label: string;

  const registry = new RegistryManager();

  switch (action) {
    case "build":
      label = "Building";
      break;
    case "clean":
      label = "Cleaning";
      break;
    default:
      label = "Unknown Command";
      break;
  }

  for (const subDir of readdirSync(libSources)) {
    // subDir could be a library or a catagory containing many libraries
    const dir = join(libSources, subDir);
    const lib = await getModule(dir, "package.ts");

    if (!lib) {
      const libCategoryDir = dir;
      // 1. Check if 'subDir' is a directory
      let subStatus;
      try {
        subStatus = statSync(libCategoryDir);
      } catch (e) {
        continue;
      }

      if (!subStatus.isDirectory()) continue;

      // Find the contents of the library.
      for (const libDir of readdirSync(libCategoryDir)) {
        const categorizedLibDir = join(libCategoryDir, libDir);
        const nestedMod = await getModule(categorizedLibDir, "package.ts");

        if (!nestedMod) continue;

        console.log(`${BOLD}${MAGENTA}${label} ${subDir}/${libDir}${RESET}\n`);

        const build = nestedMod.build?.(categorizedLibDir);

        let buildConfig: BuildConfiguration = {
          info: nestedMod.info,
          build,
        };

        await runPackageAction(
          action,
          categorizedLibDir,
          buildConfig,
          registry
        );
      }
      continue;
    }

    console.log(`${BOLD}${MAGENTA}${label} ${subDir}${RESET}\n`);

    const build = lib.build?.(dir);
    await runPackageAction(action, dir, build, registry);
  }
}
