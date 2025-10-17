[Main Release](https://github.com/mstorsjo/llvm-mingw/releases)

## Other

[llvm-project Release](https://github.com/llvm/llvm-project/releases)

Linux-Toolchain

# 1) Make a container and install the dev packages raylib needs

```bash
docker run --name linux-multiarch-sysroot -it ubuntu:22.04 bash -lc '
  set -e
  dpkg --add-architecture arm64
  apt update
  DEBIAN_FRONTEND=noninteractive apt install -y \
    build-essential cmake ninja-build pkg-config \
    # C/C++ runtimes/headers for BOTH arches
    libc6-dev:amd64    libc6-dev:arm64 \
    libgcc-12-dev:amd64 libgcc-12-dev:arm64 \
    libstdc++-12-dev:amd64 libstdc++-12-dev:arm64 \
    # graphics/audio deps for BOTH arches (add what you need)
    libasound2-dev:amd64    libasound2-dev:arm64 \
    libx11-dev:amd64        libx11-dev:arm64 \
    libxrandr-dev:amd64     libxrandr-dev:arm64 \
    libxi-dev:amd64         libxi-dev:arm64 \
    libxcursor-dev:amd64    libxcursor-dev:arm64 \
    libxinerama-dev:amd64   libxinerama-dev:arm64 \
    libxxf86vm-dev:amd64    libxxf86vm-dev:arm64 \
    libgl1-mesa-dev:amd64   libgl1-mesa-dev:arm64 \
    libglvnd-dev:amd64      libglvnd-dev:arm64
  apt clean && rm -rf /var/lib/apt/lists/*
'
```

# 2) Export the container filesystem to a tarball

```bash
docker export raylib-sysroot -o linux22.04-sysroot.tar
```

1. Move `Sysroot/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2`
   to
   `Sysroot/lib64/ld-linux-x86-64.so.2`

```cmake
# Target Linux
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR x86_64)

# Point to your extracted rootfs
set(CMAKE_SYSROOT "D:/linux-sysroot")

# Use clang/clang++ from your LLVM install
set(CMAKE_C_COMPILER "D:/Dev/.../clang.exe")       # <-- adjust
set(CMAKE_CXX_COMPILER "D:/Dev/.../clang++.exe")   # <-- adjust

# Tell clang to target Linux
set(CMAKE_C_COMPILER_TARGET x86_64-unknown-linux-gnu)
set(CMAKE_CXX_COMPILER_TARGET x86_64-unknown-linux-gnu)

# Make CMake search headers/libs inside the sysroot
set(CMAKE_FIND_ROOT_PATH "${CMAKE_SYSROOT}")
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# Help the linker/compiler honor the sysroot
set(CMAKE_EXE_LINKER_FLAGS "--sysroot=${CMAKE_SYSROOT}")
set(CMAKE_C_FLAGS "--sysroot=${CMAKE_SYSROOT}")
set(CMAKE_CXX_FLAGS "--sysroot=${CMAKE_SYSROOT}")

# pkg-config: point it at the sysroot's .pc files
set(ENV{PKG_CONFIG_DIR} "")
set(ENV{PKG_CONFIG_SYSROOT_DIR} "${CMAKE_SYSROOT}")
# Common locations in Ubuntu rootfs:
set(ENV{PKG_CONFIG_LIBDIR}
    "${CMAKE_SYSROOT}/usr/lib/x86_64-linux-gnu/pkgconfig;${CMAKE_SYSROOT}/usr/lib/pkgconfig;${CMAKE_SYSROOT}/usr/share/pkgconfig")

```
