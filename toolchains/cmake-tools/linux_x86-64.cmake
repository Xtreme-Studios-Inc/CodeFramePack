# Target Linux x86_64
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR x86_64)
set(CMAKE_CROSSCOMPILING ON)

# Path to your extracted Linux rootfs
set(CMAKE_SYSROOT "${CMAKE_CURRENT_LIST_DIR}/../linux/linux22-sysroot")


# Make searches happen inside the sysroot
set(CMAKE_FIND_ROOT_PATH "${CMAKE_SYSROOT}")
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# ---------- Cross-compile fixes & GCC runtime preference ----------
# Make try-compile build a static library (no run step for cross)
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

# -----------------------------------------------------------------

# # ---------- Linker settings ----------
set(CMAKE_EXE_LINKER_FLAGS_INIT
  "-fuse-ld=lld -Wl,--dynamic-linker=${CMAKE_SYSROOT}/usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2")
set(CMAKE_SHARED_LINKER_FLAGS_INIT "-fuse-ld=lld")
set(CMAKE_MODULE_LINKER_FLAGS_INIT "-fuse-ld=lld")



# pkg-config (you need a pkg-config.exe in PATH e.g. from MSYS2)
set(ENV{PKG_CONFIG_DIR} "")
set(ENV{PKG_CONFIG_SYSROOT_DIR} "${CMAKE_SYSROOT}")
