import unzipper from "unzipper";

// import { cp, rename, rm } from "node:fs/promises";
import { mkdirSync, existsSync } from "node:fs";
import path, { join, resolve } from "node:path";
import { download } from "codeframe-bridge/network";
import { moveDir } from "codeframe-bridge/filesystem";
// import { createHash } from "node:crypto";
import type { Toolchain, Resource } from "../types/tool-config";
import type { CFPackConfig } from "../types/types";

const RESOURCE_DIR = resolve(process.cwd(), "toolchains/resources");
const TOOLCHAIN_DIR = resolve(process.cwd(), "toolchains");
// const DEST_DIR = BASE_DIR;
const RESOURCE_EXTRACT_DIR = RESOURCE_DIR; // unzip into same dir
const TOOLCHAIN_EXTRACT_DIR = TOOLCHAIN_DIR; // unzip into same dir

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

  const EXTRACT_PATH = join(extractDir, dirName);
  await moveDir(EXTRACT_PATH, destDir);
}

async function extract(filePath: string, destDir: string) {
  // 1. Clean previous failed attempts (Crucial)
  await Bun.spawn(["rm", "-rf", destDir]).exited;
  await Bun.spawn(["mkdir", "-p", destDir]).exited;

  console.log(`📦 Extracting ${path.basename(filePath)}...`);

  const cwd = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const relativeDest = path.relative(cwd, destDir); // Ensures no "D:" drive issues

  const cmd = ["tar", "-xf", fileName, "-C", relativeDest];

  const proc = Bun.spawn(cmd, {
    cwd: cwd,
    stdout: "inherit",
    stderr: "inherit",
    // 👇 THIS IS THE FIX. It forces MinGW tar to use Windows symlinks.
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

async function getResources(resources: Resource[]) {
  for (const resource of resources) {
    const extension = resource.downloadUrl.endsWith(".tar.xz")
      ? ".tar.xz"
      : ".zip";

    const ZIP_PATH = join(RESOURCE_DIR, `${resource.name}${extension}`);
    const DEST_PATH = join(RESOURCE_DIR, `${resource.name}`);
    await download(resource.downloadUrl, ZIP_PATH);

    if (extension == ".tar.xz") await extract(ZIP_PATH, DEST_PATH);
    else await extractZip(ZIP_PATH, RESOURCE_EXTRACT_DIR, DEST_PATH);

    console.log("🟢 Completed:");
    console.log(`   ${RESOURCE_EXTRACT_DIR}\\${resource.name}`);
  }
}

async function getToolchains(toolchains: Toolchain[]) {
  for (const toolchain of toolchains) {
    const ZIP_PATH = join(RESOURCE_DIR, `${toolchain.name}.zip`);
    const DEST_PATH = join(RESOURCE_DIR, toolchain.name);
    await download(toolchain.downloadUrl, ZIP_PATH);
    await extractZip(ZIP_PATH, TOOLCHAIN_EXTRACT_DIR, DEST_PATH);

    console.log("🟢 Completed:");
    console.log(`   ${TOOLCHAIN_EXTRACT_DIR}\\${toolchain.name}`);
  }
}

export async function setup(config: CFPackConfig) {
  if (!existsSync(RESOURCE_DIR)) mkdirSync(RESOURCE_DIR, { recursive: true });

  await getResources(config.resources);
  // getToolchains(config.toolchains);

  console.log("🎉 Done");
}
