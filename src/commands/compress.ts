import { readdirSync } from "node:fs";
import { PACKAGE_DIR } from "../core/types/package.types";
import { run } from "../core/util";

import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { basename } from "node:path";

export async function compressFolder(
  srcParentPath: string,
  destBasePath: string
) {
  // Derive the folder name and final archive path
  // destBasePath comes in as ".../build/ship/vulkan"
  const folderName = basename(destBasePath);

  const cleanParentPath = srcParentPath.replaceAll("\\", "/");
  const destArchive = `${destBasePath}.tar.zst`.replaceAll("\\", "/");

  // Ensure the destination directory exists
  // (Since compressAll runs 'rm -rf' on the build dir, we must recreate it)
  mkdirSync(dirname(destArchive), { recursive: true });

  // Construct the Tar command
  // --zstd: Use zstandard compression
  const cmd = [
    "tar",
    "--zstd",
    "--force-local",
    "-cf",
    destArchive,
    `./${folderName}`,
  ];

  await run(cmd, `Compressing ${folderName}`, { cwd: cleanParentPath });
}

export async function compressAll() {
  const outDir = join(process.cwd(), "build/ship");
  await run(`rm -rf ${outDir}`);

  const entries = readdirSync(join(PACKAGE_DIR, "cpp-packages"), {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const srcParent = entry.parentPath;
    const destBase = join(outDir, entry.name);

    await compressFolder(srcParent, destBase);
  }
}
