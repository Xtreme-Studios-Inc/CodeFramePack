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
import { spawn } from "bun";
import { platform } from "process";

import type { BuildType, Cmd } from "./types/package-config";
import { BOLD, DARK_GREEN, GREEN, MAGENTA, RESET } from "./types/theme";

let CWD: string;

export function toSpawnCmd(cmd: Cmd): string[] {
  if (Array.isArray(cmd)) return cmd; // no shell
  // use a shell so quotes/&&/env vars work
  return platform === "win32"
    ? ["cmd.exe", "/d", "/s", "/c", cmd]
    : ["bash", "-lc", cmd];
}

export async function run(
  cmd: Cmd,
  label?: string,
  opts: { cwd?: string } = {}
) {
  if (label) console.log(`${BOLD}${DARK_GREEN} ${label}${RESET}`);
  console.log("Command: ");
  console.log(cmd);
  console.log("- Started -");

  try {
    const p = spawn({
      cmd: toSpawnCmd(cmd),
      cwd: opts.cwd,
      stdout: "inherit",
      stderr: "inherit",
    });

    const code = await p.exited;

    if (code !== 0) {
      console.error(`✗ ${label ?? "Command"} failed with exit code ${code}`);
      return { code, success: false };
    }

    return { code, success: true };
  } catch (err) {
    console.error(`✗ ${label ?? "Command"} threw`, err);
    return { code: -1, success: false, error: err };
  }
}

// explicit order, fully typed:
const buildOrder = [
  "windows_x86_64",
  "windows_aarch64",
  "linux_x86_64",
  "linux_aarch64",
] as const;

export async function build(build: BuildType) {
  if (build.type === "architectures") {
    const flatten = (c: Cmd) =>
      typeof c === "string" ? c.replace(/\s+/g, " ").trim() : c;

    for (const name of buildOrder) {
      const cfg = build[name];

      console.log(`\n${BOLD}${GREEN}=== ${name} ===${RESET}`);
      await run(flatten(cfg.configStep), `Configuring (${name})`, {
        cwd: CWD,
      });
      await run(cfg.buildStep, `Building (${name})`, { cwd: CWD });
      await run(cfg.installStep, `Installing (${name})`, { cwd: CWD });
      console.log(`✅ Done: ${name}`);
    }
  } else if (build.type === "headers") {
    // ✅ Iterate over each library path
    for (const [installPath, files] of Object.entries(build.libs)) {
      // Ensure destination directory exists
      const destDir = join(installPath);
      if (!existsSync(destDir)) {
        mkdirSync(join(destDir), { recursive: true });
        console.log(`Created directory: ${destDir}`);
      }

      // Copy each file
      for (const file of files) {
        const srcPath = resolve(CWD, file);
        console.log(srcPath);
        const fileName = basename(srcPath);
        const destPath = join(installPath, fileName);

        if (!existsSync(srcPath)) {
          console.warn(`⚠️ Source file missing: ${srcPath}`);
          continue;
        }

        const st = lstatSync(srcPath);

        try {
          if (st.isDirectory()) {
            // Copy entire directory (recursive)
            // Ensure parent exists (cpSync will create children)
            if (!existsSync(destPath)) mkdirSync(destPath, { recursive: true });
            cpSync(srcPath, destPath, { recursive: true });
            console.log(`Copied dir ${srcPath} → ${destPath}`);
          } else {
            // Copy single file
            const destParent = dirname(destPath);
            if (!existsSync(destParent))
              mkdirSync(destParent, { recursive: true });
            copyFileSync(srcPath, destPath);
            console.log(`Copied ${srcPath} → ${destPath}`);
          }
        } catch (err) {
          console.error(`❌ Copy failed for ${srcPath} → ${destPath}:`, err);
        }

        // if (existsSync(srcPath)) {
        //   copyFileSync(srcPath, destPath);
        //   console.log(`Copied ${file} → ${destPath}`);
        // } else {
        //   console.warn(`⚠️ Source file missing: ${srcPath}`);
        // }
      }
    }
  }
  console.log("\n🎉 All builds complete.");
}

// Single Action
export async function runPackageAction(
  action: string,
  cwd: string = process.cwd(),
  builds: BuildType
) {
  CWD = cwd;
  if (action == "build") {
    await build(builds);
  } else if (action == "clean") {
    const buildDir = join(cwd, "build");
    await run(`rm -rf ${buildDir}`);
  } else if (action == "help") {
    console.log(
      `${BOLD}${MAGENTA}build:${RESET} builds the project for all supported architectures \n${BOLD}${MAGENTA}clean:${RESET} deletes the build directory`
    );
  }
}

async function getModule(dirPath: string, file: string): Promise<any | null> {
  if (!statSync(dirPath).isDirectory()) return null;

  const tsPath = join(dirPath, ".codeframe", file); // e.g. "build.ts"
  if (!existsSync(tsPath)) return null;

  return await import(pathToFileURL(tsPath).href); // <-- key fix
}

// Multi Actions
export async function runPackageActions(action: string, baseDir: string) {
  let label: string;

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

  for (const sub of readdirSync(baseDir)) {
    const libDir = join(baseDir, sub);
    const mod = await getModule(libDir, "package.ts");

    if (!mod) continue;

    console.log(`${BOLD}${MAGENTA}${label} ${sub}${RESET}\n`);

    const build = mod.build?.(libDir);
    await runPackageAction(action, libDir, build);
  }
}
