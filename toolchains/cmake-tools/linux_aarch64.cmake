# Target Linux x86_64
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR aarch64)
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

set(LD  "${CMAKE_SYSROOT}/lib64/aarch64-linux-gnu/ld-linux-aarch64.so.1")
set(_LIB    "${CMAKE_SYSROOT}/lib/aarch64-linux-gnu")
set(_USRLIB "${CMAKE_SYSROOT}/usr/lib/aarch64-linux-gnu")
set(LIBM "${CMAKE_SYSROOT}/usr/lib/aarch64-linux-gnu/libm.so")

set(_LSEARCH "-Wl,-rpath-link=${_USRLIB} -Wl,-rpath-link=${_LIB} -L${_USRLIB} -L${_LIB}")

# # ---------- Linker settings ----------
set(CMAKE_EXE_LINKER_FLAGS_INIT
  "-fuse-ld=lld -Wl,--dynamic-linker=${LD} ${LIBM} ${_LSEARCH}")
  # "-fuse-ld=lld -Wl,--dynamic-linker=${CMAKE_SYSROOT}/lib64/ld-linux-aarch64.so.1")
set(CMAKE_SHARED_LINKER_FLAGS_INIT "-fuse-ld=lld ${LIBM} ${_LSEARCH}")
set(CMAKE_MODULE_LINKER_FLAGS_INIT "-fuse-ld=lld ${LIBM} ${_LSEARCH}")

# Make sure all langs see the sysroot
set(CMAKE_C_FLAGS_INIT   "--sysroot=${CMAKE_SYSROOT}")
set(CMAKE_CXX_FLAGS_INIT "--sysroot=${CMAKE_SYSROOT}")
set(CMAKE_ASM_FLAGS_INIT "--sysroot=${CMAKE_SYSROOT}")



# pkg-config (you need a pkg-config.exe in PATH e.g. from MSYS2)
set(ENV{PKG_CONFIG_DIR} "")
set(ENV{PKG_CONFIG_SYSROOT_DIR} "${CMAKE_SYSROOT}")
