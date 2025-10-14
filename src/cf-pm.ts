import { mkdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { argv } from "node:process";
import { cp, rename, rm } from "node:fs/promises";
import unzipper from "unzipper";
import { cleanPackages, processPackages } from "./packages";
import type { Toolchain } from "types/tool-config";
import { BOLD, MAGENTA, RESET } from "./types/theme";

const toolchains: Toolchain[] = [
  {
    name: "llvm-mingw",
    downloadUrl:
      "https://github.com/mstorsjo/llvm-mingw/releases/download/20251007/llvm-mingw-20251007-ucrt-x86_64.zip",
  },
];

const BASE_DIR = resolve(process.cwd(), "toolchains");
const DEST_DIR = BASE_DIR;
const EXTRACT_DIR = DEST_DIR; // unzip into same dir

async function download(url: string, outPath: string) {
  if (existsSync(outPath)) {
    console.log(`✔ Already Downloaded: ${outPath}`);
    return;
  }

  console.log(`⬇️  Downloading\n${url}\n→ ${outPath}`);
  const res = await fetch(url);
  if (!res.ok || !res.body)
    throw new Error(`HTTP ${res.status} ${res.statusText}`);

  // stream to disk and compute sha256 on the fly
  const writer = Bun.file(outPath).writer();
  const hash = createHash("sha256");
  const reader = res.body.getReader();

  let received = 0;
  const total = Number(res.headers.get("content-length") ?? 0);

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    hash.update(value);
    await writer.write(value);
    if (total) {
      const pct = Math.floor((received / total) * 100);
      if (pct % 5 === 0) process.stdout.write(`\r   ${pct}%`);
    }
  }
  await writer.end();
  const digest = hash.digest("hex");
  process.stdout.write("\r");
  console.log(`✅ Saved ${received} bytes`);
  return digest;
}

async function moveDir(src: string, dest: string) {
  try {
    await rename(src, dest);
  } catch {
    // fallback: copy then delete (works across volumes / locked rename)
    await cp(src, dest, { recursive: true, force: true });
    await rm(src, { recursive: true, force: true });
  }
}

export async function extractedDirName(
  zipPath: string
): Promise<string | undefined> {
  const z = await unzipper.Open.file(zipPath);
  const roots = new Set<string>();

  for (const f of z.files) {
    const clean = f.path.replace(/^[/\\]+/, "");
    if (!clean) continue;
    roots.add(clean.split(/[/\\]/)[0]);
    if (roots.size > 1) return ""; // multiple different roots
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

async function setup() {
  if (!existsSync(DEST_DIR)) mkdirSync(DEST_DIR, { recursive: true });

  for (const toolchain of toolchains) {
    const ZIP_PATH = join(DEST_DIR, `${toolchain.name}.zip`);
    const DEST_PATH = join(DEST_DIR, toolchain.name);
    await download(toolchain.downloadUrl, ZIP_PATH);
    await extractZip(ZIP_PATH, EXTRACT_DIR, DEST_PATH);

    console.log("🛣️  add to PATH:");
    console.log(`   ${EXTRACT_DIR}\\${toolchain.name}/bin`);
  }

  console.log("🎉 Done");
}

async function main(cmd: string) {
  switch (cmd) {
    case "setup":
      await setup();
      break;
    case "build-all":
      await processPackages("./lib-sources", "cf-auto.ts");
      break;
    case "clean-all":
      await cleanPackages("./lib-sources", "cf-auto.ts");
      break;
    case "clean-tools":
      console.log("Would Clean Tools");
      break;
    case "help":
      console.log(
        `${BOLD}${MAGENTA}------- Help -------${RESET}\n`,
        `${BOLD}${MAGENTA}setup:${RESET} downloads all dependencies\n`,
        `${BOLD}${MAGENTA}build-all:${RESET} builds all packages\n`,
        `${BOLD}${MAGENTA}clean-all:${RESET} cleans all all package build directories\n`,
        `${BOLD}${MAGENTA}clean-tools:${RESET} cleans out dependencies\n`
      );
      break;
    default:
      console.log(`Command ${cmd} does not exist in CodeFramePackages`);
      break;
  }
}

const args = argv.slice(2);
const [cmd = "help"] = args;

main(cmd);
