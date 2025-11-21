# #!/bin/bash
# set -euo pipefail

# declare -A configs=(
#   ["amd64"]="Dockerfile.linux.amd64"
#   ["aarch64"]="Dockerfile.linux.aarch64"
# )

# for arch in "${!configs[@]}"; do
#   image="linux-builder-$arch"
#   container="linux-container-$arch"
#   tarball="linux24-$arch.tar"

#   echo "--- Building sysroot for $arch ---"
#   docker build --no-cache -f "${configs[$arch]}" -t "$image" .

#   echo "--- Creating container for $arch ---"
#   docker create --name "$container" "$image" >/dev/null

#   echo "--- Exporting sysroot to $tarball ---"
#   docker export "$container" -o "$tarball"

#   echo "--- Cleaning up $arch ---"
#   docker rm "$container" >/dev/null || true
#   docker rmi "$image" >/dev/null || true
# done

# echo "--- Done! ---"
# echo "Sysroots created:"
# ls -lh linux24-*.tar

#!/bin/bash
set -euo pipefail

# Configs for Dockerfiles
declare -A configs=(
  ["amd64"]="Dockerfile.linux.amd64"
  # ["aarch64"]="Dockerfile.linux.aarch64"
)

# GNU Triplets for folder paths
declare -A triplets=(
  ["amd64"]="x86_64-linux-gnu"
  # ["aarch64"]="aarch64-linux-gnu"
)

for arch in "${!configs[@]}"; do
  image="linux-builder-$arch"
  container="linux-container-$arch"
  tarball="linux24-$arch.tar"
  triplet="${triplets[$arch]}"
  temp_dir="temp_sysroot_$arch"

  echo "--- Building image for $arch (No Cache) ---"
  # --no-cache ensures we get LLVM 21, not stale LLVM 20
  docker build --no-cache -f "${configs[$arch]}" -t "$image" .

  echo "--- Creating container for $arch ---"
  docker create --name "$container" "$image" >/dev/null

  echo "--- Extracting Sysroot Files ---"
  rm -rf "$temp_dir"
  mkdir -p "$temp_dir/usr/lib"
  mkdir -p "$temp_dir/usr/include/c++"

  # 1. Copy standard headers
  docker cp "$container":/usr/include "$temp_dir/usr/"

  # 2. Copy system libraries (libc, libm, etc.)
  docker cp "$container":/usr/lib/"$triplet" "$temp_dir/usr/lib/"

  # 3. Copy LLVM C++ headers
  docker cp "$container":/usr/lib/llvm-21/include/c++/v1 "$temp_dir/usr/include/c++/"

  # 4. CRITICAL FIX: Copy LLVM 21 Static Libraries (libc++.a)
  # If the script fails here, then you are right and llvm-21 is missing.
  # If it succeeds, you will have the files you need.
  echo "Copying LLVM libraries..."
  mkdir -p "$temp_dir/usr/lib/llvm-lib"
  docker cp "$container":/usr/lib/llvm-21/lib/. "$temp_dir/usr/lib/llvm-lib/"
  mv "$temp_dir/usr/lib/llvm-lib/"* "$temp_dir/usr/lib/"
  rmdir "$temp_dir/usr/lib/llvm-lib"

  echo "--- Packing optimized sysroot to $tarball ---"
  # Tar the contents of the temp folder
  tar -cf "$tarball" -C "$temp_dir" .

  echo "--- Cleaning up $arch ---"
  rm -rf "$temp_dir"
  docker rm "$container" >/dev/null || true
  # docker rmi "$image" >/dev/null || true
done

echo "--- Done! ---"
ls -lh linux24-*.tar
