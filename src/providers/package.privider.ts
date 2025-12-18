// import { exists } from "node:fs/promises";
import path, { resolve } from "node:path";
import { arch, platform } from "node:process";

export const CMAKE_TOOLS = path.resolve(
  process.cwd(),
  "../../../toolchains/cmake-tools"
);

export const CPP_OUTPUT_DIR = path.resolve(
  process.cwd(),
  "../../../build/generated-packages/cpp"
);
export const C_OUTPUT_DIR = path.resolve(
  process.cwd(),
  "../../../build/generated-packages/c"
);

export const PACKAGE_DIR = path.resolve(process.cwd(), "./packages");

export * from "../core/types/package.types";
export * from "../commands/packages";

export function getSysrootPath(currentPlatform: string, arch: string) {
  const folderName: string = `${currentPlatform}.${arch}`;

  const path: string = resolve(
    process.cwd(),
    "../../../toolchains/",
    folderName
  );

  return path;
}

export const SYSROOT = {
  windows_x86_64: getSysrootPath("windows", "x86_64"),
  windows_aarch64: getSysrootPath("windows", "aarch64"),
  linux_x86_64: getSysrootPath("linux", "x86_64"),
  linux_aarch64: getSysrootPath("linux", "aarch64"),
};

export function getHostSysrootPath() {
  const currentArch: string = arch === "x64" ? "x86_64" : "aarch64";
  let currentPlatform: string;

  switch (platform) {
    case "win32":
      currentPlatform = "windows";
      break;
    case "darwin": // macOS
      currentPlatform = "macos";
      break;
    case "linux":
    default:
      currentPlatform = "linux";
      break;
  }

  const folderName: string = `${currentPlatform}.${currentArch}`;

  const path: string = resolve(
    process.cwd(),
    "../../../toolchains/",
    folderName
  );
  // console.log(path);
  // const sysrootOK = Promise.resolve(exists(path));

  // if (!sysrootOK) console.log("BREAK");

  return path;
}
