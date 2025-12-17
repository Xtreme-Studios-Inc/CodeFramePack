import { spawn } from "node:child_process";

import type { DockerResource } from "../../core/types/tool-config";
import path from "node:path";
import { mkdir, readdir, rename, rm } from "node:fs/promises";
import { RESOURCE_DIR } from "./toolchain-constants";

// run command with LIVE output
function run(command: string) {
  return new Promise<void>((resolve, reject) => {
    const process = spawn(command, { shell: true, stdio: "inherit" });

    process.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed: ${command}\nExit code: ${code}`));
    });
  });
}

export async function buildToolchains(
  toolchains: Record<string, DockerResource>
) {
  for (const [name, toolchain] of Object.entries(toolchains)) {
    // Map JSON properties to script variables
    const image = `builder-${name}`;
    const container = `container-${name}`;
    const tarballPath = path.join(RESOURCE_DIR, `24-${name}.tar`);
    const triplet = toolchain.triplet;
    const resourceDir = path.join(RESOURCE_DIR, name);
    const dockerFilePath = path.join(
      import.meta.dir,
      "containers",
      toolchain.dockerFile
    );

    console.log(`\n\n=== 🚀 PROCESSING: ${name} ===`);
    console.log(`[1/6] Building Docker Image...`);
    // Note: We use the resolved dockerFilePath here
    await run(`docker build --no-cache -f "${dockerFilePath}" -t "${image}" .`);

    try {
      console.log(`[2/6] Creating Container...`);
      await run(`docker create --name "${name}" "${image}"`);

      console.log(`[3/6] Preparing Temp Directory...`);
      await rm(resourceDir, { recursive: true, force: true });

      await mkdir(path.join(resourceDir, "usr/lib"), { recursive: true });
      await mkdir(path.join(resourceDir, "usr/include/c++"), {
        recursive: true,
      });

      console.log(`[4/6] Extracting Files...`);
      await run(`docker cp "${name}":/usr/include "${resourceDir}/usr/"`);
      await run(
        `docker cp "${name}":/usr/lib/"${triplet}" "${resourceDir}/usr/lib/"`
      );
      // TODO

      // GCC Resources to the lib folder
      if (name == "linux.x86_64.sysroot")
        await run(
          `docker cp "${name}":/usr/lib/gcc "${resourceDir}/usr/lib/gcc/"`
        );
      else if (name == "linux.aarch64.sysroot")
        await run(
          `docker cp "${name}":/usr/lib/gcc-cross "${resourceDir}/usr/lib/gcc/"`
        );

      // if(name == "linux.x86_64.sysroot")
      //   await run(`docker cp "${name}":/usr/lib/"gcc" "${resourceDir}/usr/lib/"`);
      //   else if (name == "linux.aarch64.sysroot")
      // await run(
      //   `docker cp "${name}":/usr/lib/"gcc-cross" "${resourceDir}/usr/lib/"`
      // );

      const v1Dest = path.join(resourceDir, "usr/include/c++/v1");
      await mkdir(v1Dest, { recursive: true });

      // 2. Copy the CONTENTS of 'v1' (using /.) into the destination
      await run(
        `docker cp "${container}":/usr/lib/llvm-21/include/c++/v1/. "${v1Dest}"`
      );

      console.log(`[4.5/6] Copying LLVM Libs...`);
      const llvmLibTemp = path.join(resourceDir, "usr/lib/llvm-lib");
      await mkdir(llvmLibTemp, { recursive: true });

      await run(
        `docker cp "${name}":/usr/lib/llvm-21/lib/. "${resourceDir}/usr/lib/llvm-lib/"`
      );

      // [FS] Move files manually (Replaces 'mv *')
      // Node.js cannot do 'mv *', so we loop through the directory
      const files = await readdir(llvmLibTemp);
      for (const file of files) {
        const srcPath = path.join(llvmLibTemp, file);
        const destPath = path.join(resourceDir, "usr/lib", file);
        await rename(srcPath, destPath);
      }
      // [FS] Remove empty temp folder
      await rm(llvmLibTemp, { recursive: true, force: true });

      console.log(`[5/6] Creating Tarball: ${tarballPath}`);
      await run(`tar -cf "${tarballPath}" -C "${resourceDir}" .`);

      console.log(`[6/6] Cleanup...`);
      await rm(resourceDir, { recursive: true, force: true });

      try {
        await run(`docker rm "${name}"`);
      } catch (e) {
        console.warn("   -> Container already removed or not found.");
      }
    } catch (e) {
      // We try-catch the cleanup to ensure the script doesn't crash on cleanup errors
      try {
        await run(`docker rm "${name}"`);
      } catch (e) {
        console.warn("   -> Container already removed or not found.");
      }
    }

    console.log(`✅ Finished ${name}`);
  }
}
