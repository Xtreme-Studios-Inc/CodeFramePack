#!/bin/bash
set -euo pipefail

declare -A configs=(
  ["amd64"]="Dockerfile.linux.amd64"
  ["aarch64"]="Dockerfile.linux.aarch64"
)

for arch in "${!configs[@]}"; do
  image="linux-builder-$arch"
  container="linux-container-$arch"
  tarball="linux24-$arch.tar"

  echo "--- Building sysroot for $arch ---"
  docker build -f "${configs[$arch]}" -t "$image" .

  echo "--- Creating container for $arch ---"
  docker create --name "$container" "$image" >/dev/null

  echo "--- Exporting sysroot to $tarball ---"
  docker export "$container" -o "$tarball"

  echo "--- Cleaning up $arch ---"
  docker rm "$container" >/dev/null || true
  docker rmi "$image" >/dev/null || true
done

echo "--- Done! ---"
echo "Sysroots created:"
ls -lh linux24-*.tar
