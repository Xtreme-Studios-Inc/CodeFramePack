import type { CFPackConfig } from "../types/types";

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
      // Utility Framework
      "https://github.com/XsAndre-L/poco.git",

      // Multimedia / Codecs
      "https://github.com/XsAndre-L/FFmpeg.git",
    ],
  },
  toolchains: [
    {
      name: "llvm-mingw",
      downloadUrl:
        "https://github.com/mstorsjo/llvm-mingw/releases/download/20251007/llvm-mingw-20251007-ucrt-x86_64.zip",
    },
    {
      name: "dependencies",
      downloadUrl:
        "https://github.com/Xtreme-Studios-Inc/CodeFrameDocs/releases/download/cf.clang.v23.01/cpp.zip",
    },
    {
      name: "linux24-aarch64",
      downloadUrl:
        "https://github.com/Xtreme-Studios-Inc/CodeFramePack/releases/download/toolchains/linux24-aarch64.zip",
    },
    {
      name: "linux24-amd64",
      downloadUrl:
        "https://github.com/Xtreme-Studios-Inc/CodeFramePack/releases/download/toolchains/linux24-amd64.zip",
    },
  ],
};
