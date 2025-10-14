import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { pathToFileURL } from "url";
import { BOLD, MAGENTA, RESET } from "./types/theme";

export async function processPackages(baseDir: string, file: string) {
  for (const sub of readdirSync(baseDir)) {
    const subDir = join(baseDir, sub);
    if (!statSync(subDir).isDirectory()) continue;

    const tsPath = join(subDir, ".codeframe", file); // e.g. "build.ts"
    if (!existsSync(tsPath)) continue;

    console.log(`${BOLD}${MAGENTA}Building ${sub}${RESET}\n`);

    const mod = await import(pathToFileURL(tsPath).href); // <-- key fix
    await mod.main?.("build", subDir);
  }
}

export async function cleanPackages(baseDir: string, file: string) {
  for (const sub of readdirSync(baseDir)) {
    const subDir = join(baseDir, sub);
    if (!statSync(subDir).isDirectory()) continue;

    const tsPath = join(subDir, ".codeframe", file); // e.g. "build.ts"
    if (!existsSync(tsPath)) continue;

    console.log(`${BOLD}${MAGENTA}Cleaning ${sub}'s build directory${RESET}\n`);

    const mod = await import(pathToFileURL(tsPath).href); // <-- key fix
    await mod.main?.("clean", subDir);
  }
}
