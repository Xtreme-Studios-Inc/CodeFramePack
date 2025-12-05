import type { Resource } from "../../types/tool-config";

export const resources: Record<string, Resource> = {
  "windows.x86_64": {
    downloadUrl:
      "https://github.com/mstorsjo/llvm-mingw/releases/download/20251118/llvm-mingw-20251118-ucrt-x86_64.zip",
  },
  "windows.aarch64": {
    downloadUrl:
      "https://github.com/mstorsjo/llvm-mingw/releases/download/20251118/llvm-mingw-20251118-ucrt-aarch64.zip",
  },
  "linux.x86_64": {
    downloadUrl:
      "https://github.com/llvm/llvm-project/releases/download/llvmorg-21.1.6/LLVM-21.1.6-Linux-X64.tar.xz",
  },
  "linux.aarch64": {
    downloadUrl:
      "https://github.com/llvm/llvm-project/releases/download/llvmorg-21.1.6/LLVM-21.1.6-Linux-ARM64.tar.xz",
  },
};
