#!/usr/bin/env bash
set -euo pipefail

# Folder where this script lives (clone targets go here)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# === Define grouped repositories ===
# Format: "group_name|repo_url"
GROUPED_REPOS=(
  "vulkan|https://github.com/XsAndre-L/Vulkan-Guide.git"
  "vulkan|https://github.com/XsAndre-L/Vulkan-Loader.git"
  "vulkan|https://github.com/XsAndre-L/Vulkan-Hpp.git"
  "vulkan|https://github.com/XsAndre-L/glslang.git"
  "vulkan|https://github.com/XsAndre-L/SPIRV-Cross.git"
  "vulkan|https://github.com/XsAndre-L/SPIRV-Tools.git"
  "vulkan|https://github.com/XsAndre-L/Vulkan-ValidationLayers.git"
  "vulkan|https://github.com/XsAndre-L/MoltenVK.git"
  "vulkan|https://github.com/XsAndre-L/shaderc.git"
  "vulkan|https://github.com/XsAndre-L/VulkanMemoryAllocator.git"
  "boost|https://github.com/XsAndre-L/asio.git"
  "boost|https://github.com/XsAndre-L/beast.git"
  "boost|https://github.com/XsAndre-L/geometry.git"
  "boost|https://github.com/XsAndre-L/compute.git"
  "boost|https://github.com/XsAndre-L/fiber.git"
  "boost|https://github.com/XsAndre-L/python.git"
)

# List all repos to clone (add more lines as needed)
REPOS=(
  # Utility Framework
  "https://github.com/XsAndre-L/poco.git"

  # Compression / Archiving
  "https://github.com/XsAndre-L/Zipios.git"
  "https://github.com/XsAndre-L/zlib.git"
  "https://github.com/XsAndre-L/zstd.git"
  "https://github.com/XsAndre-L/lz4.git"
  "https://github.com/XsAndre-L/libarchive.git"
  "https://github.com/XsAndre-L/brotli.git"

  # Windowing / Input / Platform
  "https://github.com/XsAndre-L/glfw.git"
  "https://github.com/XsAndre-L/SDL.git"

  # Graphics / Rendering (APIs, loaders, engines)
  "https://github.com/XsAndre-L/glad.git"
  "https://github.com/XsAndre-L/raylib.git"
  "https://github.com/XsAndre-L/raygui.git"

  # UI (Immediate-mode) / Visualization
  "https://github.com/XsAndre-L/imgui.git"
  "https://github.com/XsAndre-L/implot.git"

  # Assets / Models / Images
  "https://github.com/XsAndre-L/assimp.git"
  "https://github.com/XsAndre-L/stb.git"
  "https://github.com/XsAndre-L/libpng.git"
  "https://github.com/XsAndre-L/libjpeg-turbo.git"
  "https://github.com/XsAndre-L/libwebp.git"
  "https://github.com/XsAndre-L/openexr.git"
  "https://github.com/XsAndre-L/libtiff.git"
  "https://github.com/XsAndre-L/tinygltf.git"
  "https://github.com/XsAndre-L/draco.git"
  "https://github.com/XsAndre-L/OpenImageIO.git"

  # Physics / ECS
  "https://github.com/XsAndre-L/entt.git"
  "https://github.com/XsAndre-L/bullet3.git"
  "https://github.com/XsAndre-L/box2d.git"
  "https://github.com/XsAndre-L/JoltPhysics.git"

  # Math / Linear Algebra
  "https://github.com/XsAndre-L/glm.git"
  "https://github.com/XsAndre-L/eigen.git"

  # Audio
  "https://github.com/XsAndre-L/miniaudio.git"
  "https://github.com/XsAndre-L/openal-soft.git"
  "https://github.com/XsAndre-L/portaudio.git"
  "https://github.com/XsAndre-L/opus.git"

  # Multimedia / Codecs
  "https://github.com/XsAndre-L/FFmpeg.git"

  # Networking / HTTP
  "https://github.com/XsAndre-L/cpp-httplib.git"
  "https://github.com/XsAndre-L/Crow.git"
  "https://github.com/XsAndre-L/curl.git"
  "https://github.com/XsAndre-L/websocketpp.git"

  # Databases / Storage
  "https://github.com/XsAndre-L/sqlite.git"
  "https://github.com/XsAndre-L/leveldb.git"
  "https://github.com/XsAndre-L/rocksdb.git"
  "https://github.com/XsAndre-L/duckdb.git"

  # Serialization / Data Formats
  "https://github.com/XsAndre-L/json.git"
  "https://github.com/XsAndre-L/yaml-cpp.git"
  "https://github.com/XsAndre-L/protobuf.git"
  "https://github.com/XsAndre-L/flatbuffers.git"

  # Cryptography / Security
  "https://github.com/XsAndre-L/cryptopp.git"
  "https://github.com/XsAndre-L/openssl.git"
  "https://github.com/XsAndre-L/libsodium.git"

  # Concurrency / Parallelism
  "https://github.com/XsAndre-L/oneTBB.git"
  "https://github.com/XsAndre-L/taskflow.git"
  "https://github.com/XsAndre-L/enkiTS.git"

  # Logging / Formatting / Time
  "https://github.com/XsAndre-L/spdlog.git"
  "https://github.com/XsAndre-L/fmt.git"
  "https://github.com/XsAndre-L/date.git"

  # Machine Learning / AI
  "https://github.com/XsAndre-L/tensorflow.git"
  "https://github.com/XsAndre-L/mlpack.git"
  "https://github.com/XsAndre-L/llama.cpp.git"
  "https://github.com/XsAndre-L/opencv.git"
  "https://github.com/XsAndre-L/onnxruntime.git"

  # Testing / Tooling
  "https://github.com/XsAndre-L/Catch2.git"
  "https://github.com/XsAndre-L/googletest.git"
  "https://github.com/XsAndre-L/benchmark.git"

  # Scripting Languages
  "https://github.com/XsAndre-L/quickjs.git"
  "https://github.com/XsAndre-L/lua.git"

  # "https://github.com/owner/another-lib.git"
  # "git@github.com:owner/private-lib.git"
)

# === Function to clone or pull ===
clone_or_pull() {
  local repo="$1"
  local dest_dir="$2"
  local name
  name="$(basename "$repo" .git)"

  echo "→ $name"

  if [[ -d "$dest_dir/$name/.git" ]]; then
    echo "   exists → pulling latest…"
    git -C "$dest_dir/$name" pull --ff-only
  else
    echo "   cloning into $dest_dir/$name"
    git clone --recurse-submodules --depth 1 "$repo" "$dest_dir/$name"
  fi
}

# === Clone normal repos ===
for repo in "${REPOS[@]}"; do
  clone_or_pull "$repo" "$SCRIPT_DIR"
done

# === Clone grouped repos ===
for entry in "${GROUPED_REPOS[@]}"; do
  group="${entry%%|*}"       # part before '|'
  repo="${entry#*|}"         # part after '|'
  group_dir="$SCRIPT_DIR/$group"
  mkdir -p "$group_dir"
  clone_or_pull "$repo" "$group_dir"
done

echo "✅ Done."
