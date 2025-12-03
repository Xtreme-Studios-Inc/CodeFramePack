import type {
  Resource,
  Toolchain,
  ToolchainScaffoldConfig,
} from "../types/tool-config";
import type { CFPackConfig } from "../types/types";

const toolchains: Record<string, Toolchain> = {
  "linux.x86_64.sysroot": {
    dockerFile: "Dockerfile.linux.x86_64",
    triplet: "x86_64-linux-gnu",
  },
  "linux.aarch64.sysroot": {
    dockerFile: "Dockerfile.linux.aarch64",
    triplet: "aarch64-linux-gnu",
  },
};

const LINUX_BINARY_EXCLUSIONS: string[] = [
  "flang-21",
  "bbc",
  "fir-opt",
  "fir-lsp-server",
  "tco",
  "mlir-*",
  "bugpoint",
  "diagtool",
  "llvm-c-test",
  "llvm-extract",
  "llvm-bcanalyzer",
  "llvm-mca",
  "llvm-cfi-verify",
  "llvm-rtdyld",
  "pp-trace",
  "llc",
  "opt",
  "llvm-mc",
  "llvm-lto",
  "llvm-lto2",
  "llvm-reduce",
  "clang-move",
  "clang-change-namespace",
  "clang-include-fixer",
  "clang-repl",
  "llvm-stress",
  "clang-tblgen",
  "llvm-tblgen",
  "tblgen-to-irdl",
  "tblgen-lsp-server",
  "llvm-diff",
  "f18-parse-demo",
  "llvm-dwarfdump",
  "llvm-dwarfutil",
  "llvm-debuginfo-analyzer",
  "llvm-debuginfod",
  "llvm-pdbutil",
  "llvm-cxxdump",
  "llvm-readtapi",
  "llvm-readobj",
  "lldb-instr",
  "lldb-dap",
  "lldb-server",
  "clang-check",
  "clang-extdef-mapping",
  "clang-refactor",
  "clang-query",
  "clang-doc",
  "clang-reorder-fields",
  "clang-include-cleaner",
  "find-all-symbols",
  "modularize",
  "c-index-test",
  "clang-apply-replacements",
  "llvm-ml",
  "llvm-gsymutil",
  "llvm-split",
  "llvm-dwp",
  "lli",
  "llvm-jitlink",
  "llvm-xray",
  "sancov",
  "llvm-profgen",
  "llvm-exegesis",
  "llvm-bolt",
  "llvm-bolt-heatmap",
  "llvm-bolt-binary-analysis",
  "clang-linker-wrapper",
  "clang-nvlink-wrapper",
  "clang-sycl-linker",
];

const toolchainScafoldConfig: Record<string, ToolchainScaffoldConfig> = {
  "windows.x86_64": {
    rules: [{ from: "windows.x86_64", to: "" }],
  },
  "windows.aarch64": {
    rules: [{ from: "windows.aarch64", to: "" }],
  },
  "linux.x86_64": {
    rules: [
      {
        from: "linux.x86_64/bin",
        to: "bin",
        exclude: LINUX_BINARY_EXCLUSIONS,
        rename: {
          "clang-21": "clang",
        },
      },
      {
        from: "linux.x86_64/lib/clang",
        to: "lib/clang",
      },
      {
        from: "linux.x86_64.sysroot",
        to: "",
      },
    ],
  },
  "linux.aarch64": {
    rules: [
      {
        from: "linux.aarch64/bin",
        to: "bin",
        exclude: LINUX_BINARY_EXCLUSIONS,
        rename: {
          "clang-21": "clang",
        },
      },
      {
        from: "linux.aarch64/lib/clang",
        to: "lib/clang",
      },
      {
        from: "linux.aarch64.sysroot",
        to: "",
      },
    ],
  },
};
const resources: Record<string, Resource> = {
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

export const config: CFPackConfig = {
  repositories: {
    groups: {
      vulkan: [
        "https://github.com/XsAndre-L/Vulkan-Guide.git",
        "https://github.com/XsAndre-L/Vulkan-Loader.git",
        "https://github.com/XsAndre-L/Vulkan-Hpp.git",
        "https://github.com/XsAndre-L/Vulkan-Headers.git",
        "https://github.com/XsAndre-L/glslang.git",
        "https://github.com/XsAndre-L/SPIRV-Cross.git",
        "https://github.com/XsAndre-L/SPIRV-Tools.git",
        "https://github.com/XsAndre-L/Vulkan-ValidationLayers.git",
        "https://github.com/XsAndre-L/MoltenVK.git",
        "https://github.com/XsAndre-L/shaderc.git",
        "https://github.com/XsAndre-L/VulkanMemoryAllocator.git",
      ],
      boost: [
        "https://github.com/XsAndre-L/asio.git",
        "https://github.com/XsAndre-L/beast.git",
        "https://github.com/XsAndre-L/geometry.git",
        "https://github.com/XsAndre-L/compute.git",
        "https://github.com/XsAndre-L/fiber.git",
        "https://github.com/XsAndre-L/python.git",
      ],
      archiving: [
        "https://github.com/XsAndre-L/Zipios.git",
        "https://github.com/XsAndre-L/zlib.git",
        "https://github.com/XsAndre-L/zstd.git",
        "https://github.com/XsAndre-L/lz4.git",
        "https://github.com/XsAndre-L/libarchive.git",
        "https://github.com/XsAndre-L/brotli.git",
      ],
      "asset-libs": [
        "https://github.com/XsAndre-L/assimp.git",
        "https://github.com/XsAndre-L/stb.git",
        "https://github.com/XsAndre-L/libpng.git",
        "https://github.com/XsAndre-L/libjpeg-turbo.git",
        "https://github.com/XsAndre-L/libwebp.git",
        "https://github.com/XsAndre-L/openexr.git",
        "https://github.com/XsAndre-L/libtiff.git",
        "https://github.com/XsAndre-L/tinygltf.git",
        "https://github.com/XsAndre-L/draco.git",
        "https://github.com/XsAndre-L/OpenImageIO.git",
      ],
      networking: [
        "https://github.com/XsAndre-L/cpp-httplib.git",
        "https://github.com/XsAndre-L/Crow.git",
        "https://github.com/XsAndre-L/curl.git",
        "https://github.com/XsAndre-L/websocketpp.git",
      ],
      "ai-libs": [
        "https://github.com/XsAndre-L/tensorflow.git",
        "https://github.com/XsAndre-L/mlpack.git",
        "https://github.com/XsAndre-L/llama.cpp.git",
        "https://github.com/XsAndre-L/opencv.git",
        "https://github.com/XsAndre-L/onnxruntime.git",
      ],
      audio: [
        "https://github.com/XsAndre-L/miniaudio.git",
        "https://github.com/XsAndre-L/openal-soft.git",
        "https://github.com/XsAndre-L/portaudio.git",
        "https://github.com/XsAndre-L/opus.git",
      ],
      "data-storage": [
        "https://github.com/XsAndre-L/sqlite.git",
        "https://github.com/XsAndre-L/leveldb.git",
        "https://github.com/XsAndre-L/rocksdb.git",
        "https://github.com/XsAndre-L/duckdb.git",
      ],
      "data-formats": [
        "https://github.com/XsAndre-L/json.git",
        "https://github.com/XsAndre-L/yaml-cpp.git",
        "https://github.com/XsAndre-L/protobuf.git",
        "https://github.com/XsAndre-L/flatbuffers.git",
      ],
      "code-embeding": [
        "https://github.com/XsAndre-L/wasmtime.git", // WASM
        "https://github.com/XsAndre-L/quickjs.git", // JS
        "https://github.com/XsAndre-L/lua.git", // Lua
        "https://github.com/XsAndre-L/sol2.git", // Lua
        "https://github.com/XsAndre-L/jni.hpp.git", // Java
        "https://github.com/XsAndre-L/pybind11.git", // Python
      ],
      gui: [
        "https://github.com/XsAndre-L/imgui.git", // Immediate-Mode
        "https://github.com/XsAndre-L/implot.git",
        "https://github.com/XsAndre-L/webview.git", // Not Immediate-Mode
        "https://github.com/XsAndre-L/raygui.git",
      ],
      physics: [
        "https://github.com/XsAndre-L/entt.git",
        "https://github.com/XsAndre-L/bullet3.git",
        "https://github.com/XsAndre-L/box2d.git",
        "https://github.com/XsAndre-L/JoltPhysics.git",
      ],
      testing: [
        "https://github.com/XsAndre-L/Catch2.git",
        "https://github.com/XsAndre-L/googletest.git",
        "https://github.com/XsAndre-L/benchmark.git",
      ],
      windowing: [
        "https://github.com/XsAndre-L/glfw.git",
        "https://github.com/XsAndre-L/SDL.git",
      ],
      rendering: [
        "https://github.com/XsAndre-L/glad.git",
        "https://github.com/XsAndre-L/raylib.git",
      ],
      math: [
        "https://github.com/XsAndre-L/glm.git",
        "https://github.com/XsAndre-L/eigen.git",
      ],
      concurrency: [
        "https://github.com/XsAndre-L/oneTBB.git",
        "https://github.com/XsAndre-L/taskflow.git",
        "https://github.com/XsAndre-L/enkiTS.git",
      ],
      cryptography: [
        "https://github.com/XsAndre-L/cryptopp.git",
        "https://github.com/XsAndre-L/openssl.git",
        "https://github.com/XsAndre-L/libsodium.git",
      ],
      utilities: [
        "https://github.com/XsAndre-L/spdlog.git",
        "https://github.com/XsAndre-L/fmt.git",
        "https://github.com/XsAndre-L/date.git",
      ],
    },
    other: [
      "https://github.com/XsAndre-L/poco.git",
      "https://github.com/XsAndre-L/FFmpeg.git",
    ],
  },
  resources,
  toolchains,
  toolchainScafoldConfig,
};

// toolchains: [
//   {
//     name: "linux24-aarch64-sysroot",
//     downloadUrl:
//       "https://github.com/Xtreme-Studios-Inc/CodeFramePack/releases/download/toolchains/linux24-aarch64.zip",
//   },
//   {
//     name: "linux24-x86_64-sysroot",
//     downloadUrl:
//       "https://github.com/Xtreme-Studios-Inc/CodeFramePack/releases/download/toolchains/linux24-amd64.zip",
//   },
// ],
