import unzipper from "unzipper";

import { mkdirSync, existsSync } from "node:fs";
import path, { join } from "node:path";
import { download } from "codeframe-bridge/network";
import { moveDir } from "codeframe-bridge/filesystem";
import type { Resource } from "../types/tool-config";
import type { CFPackConfig } from "../types/types";
import { buildToolchains } from "./toolchains/build-toolchains";
import { RESOURCE_DIR } from "./toolchains/toolchain-constants";
import { organiseToolchains } from "./toolchains/toolchains";

export async function extractedDirName(
  zipPath: string
): Promise<string | undefined> {
  const zip = await unzipper.Open.file(zipPath);
  const roots = new Set<string>();

  for (const file of zip.files) {
    const clean = file.path.replace(/^[/\\]+/, "");
    if (!clean) continue;

    const rootPart = clean.split(/[/\\]/)[0]!;
    roots.add(rootPart);

    if (roots.size > 1) return undefined; // multiple different roots
  }

  return roots.size === 1 ? [...roots][0] : "";
}

async function extractZip(
  zipFile: string,
  extractDir: string,
  destDir: string
) {
  mkdirSync(extractDir, { recursive: true });
  await unzipper.Open.file(zipFile).then((d: any) =>
    d.extract({ path: extractDir, concurrency: 8 })
  );

  const dirName: string | undefined = await extractedDirName(zipFile);
  if (!dirName) return;

  const extractPath = join(extractDir, dirName);
  await moveDir(extractPath, destDir);
}

async function extract(filePath: string, destDir: string) {
  // 1. Clean previous failed attempts (Crucial)
  await Bun.spawn(["rm", "-rf", destDir]).exited;
  await Bun.spawn(["mkdir", "-p", destDir]).exited;

  console.log(`📦 Extracting ${path.basename(filePath)}...`);

  const cwd = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const relativeDest = path.relative(cwd, destDir); // Ensures no "D:" drive issues

  const cmd = [
    "tar",
    "-xf",
    fileName,
    "-C",
    relativeDest,
    "--strip-components=1",
  ];

  const proc = Bun.spawn(cmd, {
    cwd: cwd,
    stdout: "inherit",
    stderr: "inherit",
    env: {
      ...process.env,
      MSYS: "winsymlinks:nativestrict",
    },
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Extraction failed for ${filePath}`);
  }
}

async function getResources(resources: Record<string, Resource>) {
  for (const [key, resource] of Object.entries(resources)) {
    const extension = resource.downloadUrl.endsWith(".tar.xz")
      ? ".tar.xz"
      : ".zip";

    const ZIP_PATH = join(RESOURCE_DIR, `${key}${extension}`);
    const DEST_PATH = join(RESOURCE_DIR, `${key}`);
    await download(resource.downloadUrl, ZIP_PATH);

    if (extension == ".tar.xz") await extract(ZIP_PATH, DEST_PATH);
    else await extractZip(ZIP_PATH, RESOURCE_DIR, DEST_PATH);

    console.log("🟢 Completed:");
    console.log(`   ${RESOURCE_DIR}\\${key}`);
  }
}

// async function getToolchains(toolchains: Toolchain[]) {
//   for (const toolchain of toolchains) {
//     const ZIP_PATH = join(RESOURCE_DIR, `${toolchain.name}.zip`);
//     const DEST_PATH = join(RESOURCE_DIR, toolchain.name);
//     await download(toolchain.downloadUrl, ZIP_PATH);
//     await extractZip(ZIP_PATH, TOOLCHAIN_EXTRACT_DIR, DEST_PATH);

//     console.log("🟢 Completed:");
//     console.log(`   ${TOOLCHAIN_EXTRACT_DIR}\\${toolchain.name}`);
//   }
// }

export async function setup(config: CFPackConfig) {
  if (!existsSync(RESOURCE_DIR)) mkdirSync(RESOURCE_DIR, { recursive: true });

  // await getResources(config.resources);
  // await buildToolchains(config.toolchains);

  await organiseToolchains(config);

  console.log("🎉 Done");
}
