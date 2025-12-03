import path, { resolve } from "node:path";

export const BUILD_DIR = resolve(process.cwd(), "build");
export const TOOLCHAIN_DIR = resolve(process.cwd(), "toolchains");
export const RESOURCE_DIR = resolve(TOOLCHAIN_DIR, "resources");
