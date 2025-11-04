# ------------------------------------------------------------
# Toolchain: Linux aarch64 (cross from host)
# ------------------------------------------------------------

# Target platform
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR aarch64)
set(CMAKE_CROSSCOMPILING ON)

# Language standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Path to your extracted Linux rootfs
set(CMAKE_SYSROOT "${CMAKE_CURRENT_LIST_DIR}/../linux24-aarch64")

# Make our custom modules discoverable
list(PREPEND CMAKE_MODULE_PATH "${CMAKE_CURRENT_LIST_DIR}")

# ------------------------------------------------------------
# Cross-compile behavior & discovery
# ------------------------------------------------------------

# Ensure try-compile does not attempt to run binaries
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

# Search inside the sysroot for libraries/includes/packages
set(CMAKE_FIND_ROOT_PATH "${CMAKE_SYSROOT}")
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_PACKAGE ONLY)

# Avoid picking host programs from inside the sysroot
set(CMAKE_IGNORE_PATH
  "${CMAKE_SYSROOT}/bin;${CMAKE_SYSROOT}/usr/bin;${CMAKE_SYSROOT}/sbin;${CMAKE_SYSROOT}/usr/sbin"
)

# Also let CMake consider these prefix roots when finding config packages
set(CMAKE_PREFIX_PATH "${CMAKE_SYSROOT}/usr;${CMAKE_SYSROOT}")


# ------------------------------------------------------------
# LLVM/Clang & libc++ locations
# ------------------------------------------------------------

set(CLANG_VER 20)
set(_triplet "aarch64-linux-gnu")

# libc++ headers (if needed for include checks)
set(LIBCXX_INCLUDE_DIR "${CMAKE_SYSROOT}/usr/lib/llvm-20/include/c++/v1")

# Clang runtime (builtins, etc.)
set(CLANG_RT_DIR       "${CMAKE_SYSROOT}/usr/lib/llvm-20/lib/clang/20/lib/linux")
set(CLANG_RT_BUILTINS  "${CLANG_RT_DIR}/libclang_rt.builtins-aarch64.a")

# libc++/abi/unwind libraries
set(LIBCXX_DIR         "${CMAKE_SYSROOT}/usr/lib/aarch64-linux-gnu")
set(LIBCXX_A           "${LIBCXX_DIR}/libc++.a")
set(LIBC_A           "${LIBCXX_DIR}/libc.so")
set(LIBCXXABI_A        "${LIBCXX_DIR}/libc++abi.so")
set(LIBUNWIND_A        "${LIBCXX_DIR}/libunwind.a")
set(LIBM               "${LIBCXX_DIR}/libm.so")
set(BUILTINS_A         "${CMAKE_SYSROOT}/usr/lib/llvm-20/lib/clang/20/lib/linux/libclang_rt.builtins-aarch64.a")

# Additional libc++ library search dirs
set(LIBCXX_LIB_DIR_1   "${CMAKE_SYSROOT}/usr/lib/${_triplet}")
set(LIBCXX_LIB_DIR_2   "${CMAKE_SYSROOT}/usr/lib/llvm-20/lib")

# ------------------------------------------------------------
# Linker setup
# ------------------------------------------------------------

# --- Linker Setup Flags (aarch64) ---
set(_linker_setup_flags_list
  -fuse-ld=lld
  -nodefaultlibs
  -nostartfiles
  -Wl,--dynamic-linker=${LIBCXX_DIR}/ld-linux-aarch64.so.1
  -L${LIBCXX_DIR}
  -L${LIBCXX_LIB_DIR_2}
  -L${LIBCXX_LIB_DIR_1}
  -L${CMAKE_SYSROOT}/usr/lib/${_triplet}
  -L${CMAKE_SYSROOT}/lib/${_triplet}
  -L${CLANG_RT_DIR}
  -Wl,-rpath-link,${LIBCXX_DIR}
  -Wl,-rpath-link,${CMAKE_SYSROOT}/usr/lib/${_triplet}
  -Wl,-rpath-link,${CMAKE_SYSROOT}/lib/${_triplet}
)
string(JOIN " " _LINKER_SETUP_FLAGS ${_linker_setup_flags_list})

# --- Linker Core Libraries (aarch64) ---
set(_linker_core_libs_list
  ${BUILTINS_A}
  -Wl,--push-state,--whole-archive ${LIBCXX_A} ${LIBC_A} -Wl,--pop-state
  ${LIBCXXABI_A}
  ${LIBUNWIND_A}
  ${LIBM}
  -lpthread
  -ldl
  -lm
  -lc
)
string(JOIN " " _LINKER_CORE_LIBS ${_linker_core_libs_list})

# Apply setup flags to all target types (init variables)
set(CMAKE_EXE_LINKER_FLAGS_INIT    "${CMAKE_EXE_LINKER_FLAGS_INIT} ${_LINKER_SETUP_FLAGS}")
set(CMAKE_SHARED_LINKER_FLAGS_INIT "${CMAKE_SHARED_LINKER_FLAGS_INIT} ${_LINKER_SETUP_FLAGS}")
set(CMAKE_MODULE_LINKER_FLAGS_INIT "${CMAKE_MODULE_LINKER_FLAGS_INIT} ${_LINKER_SETUP_FLAGS}")

# Ensure core libs are appended by CMake at the end of link lines
set(CMAKE_C_STANDARD_LIBRARIES  "${_LINKER_CORE_LIBS}")
set(CMAKE_CXX_STANDARD_LIBRARIES "${_LINKER_CORE_LIBS}")

# ------------------------------------------------------------
# pkg-config for cross builds
# ------------------------------------------------------------

# Clear default dir and set sysroot for pkg-config
set(ENV{PKG_CONFIG_DIR} "")
set(ENV{PKG_CONFIG_SYSROOT_DIR} "${CMAKE_SYSROOT}")

# Use forward slashes; ';' is list separator on Windows
set(ENV{PKG_CONFIG_LIBDIR}
  "${CMAKE_SYSROOT}/usr/lib/${_triplet}/pkgconfig;${CMAKE_SYSROOT}/usr/lib/pkgconfig;${CMAKE_SYSROOT}/usr/share/pkgconfig"
)

# ------------------------------------------------------------
# GTK / WebKit include roots (override/fixups)
# ------------------------------------------------------------

set(_gtk_includes
  "-isystem ${CMAKE_SYSROOT}/usr/include/gtk-3.0"
  "-isystem ${CMAKE_SYSROOT}/usr/include/glib-2.0"
  "-isystem ${CMAKE_SYSROOT}/usr/lib/${_triplet}/glib-2.0/include"
  "-isystem ${CMAKE_SYSROOT}/usr/include/cairo"
  "-isystem ${CMAKE_SYSROOT}/usr/include/pango-1.0"
  "-isystem ${CMAKE_SYSROOT}/usr/include/gdk-pixbuf-2.0"
  "-isystem ${CMAKE_SYSROOT}/usr/include/atk-1.0"
  "-isystem ${CMAKE_SYSROOT}/usr/include/at-spi-2.0"
  "-isystem ${CMAKE_SYSROOT}/usr/include/at-spi2-atk/2.0"
  "-isystem ${CMAKE_SYSROOT}/usr/include/webkitgtk-4.1"
  "-isystem ${CMAKE_SYSROOT}/usr/include/harfbuzz"
  "-isystem ${CMAKE_SYSROOT}/usr/include/libsoup-3.0"
)

string(JOIN " " _gtk_includes_str ${_gtk_includes})

set(CMAKE_C_FLAGS_INIT   "${CMAKE_C_FLAGS_INIT} ${_gtk_includes_str}")
set(CMAKE_CXX_FLAGS_INIT "${CMAKE_CXX_FLAGS_INIT} ${_gtk_includes_str} \
-std=c++20 -D_LIBCPP_HAS_THREAD_API_PTHREAD")






# # ---------- Cross-compile fixes & GCC runtime preference ----------
# # Make try-compile build a static library (no run step for cross)
# set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)

# # -----------------------------------------------------------------

# set(LD  "${CMAKE_SYSROOT}/lib64/aarch64-linux-gnu/ld-linux-aarch64.so.1")
# set(_LIB    "${CMAKE_SYSROOT}/lib/aarch64-linux-gnu")
# set(_USRLIB "${CMAKE_SYSROOT}/usr/lib/aarch64-linux-gnu")
# set(LIBM "${CMAKE_SYSROOT}/usr/lib/aarch64-linux-gnu/libm.so")

# set(_LSEARCH "-Wl,-rpath-link=${_USRLIB} -Wl,-rpath-link=${_LIB} -L${_USRLIB} -L${_LIB}")

# # # ---------- Linker settings ----------
# set(CMAKE_EXE_LINKER_FLAGS_INIT
#   "-fuse-ld=lld -Wl,--dynamic-linker=${LD} ${LIBM} ${_LSEARCH}")
#   # "-fuse-ld=lld -Wl,--dynamic-linker=${CMAKE_SYSROOT}/lib64/ld-linux-aarch64.so.1")
# set(CMAKE_SHARED_LINKER_FLAGS_INIT "-fuse-ld=lld ${LIBM} ${_LSEARCH}")
# set(CMAKE_MODULE_LINKER_FLAGS_INIT "-fuse-ld=lld ${LIBM} ${_LSEARCH}")

# # Make sure all langs see the sysroot
# set(CMAKE_C_FLAGS_INIT   "--sysroot=${CMAKE_SYSROOT}")
# set(CMAKE_CXX_FLAGS_INIT "--sysroot=${CMAKE_SYSROOT}")
# set(CMAKE_ASM_FLAGS_INIT "--sysroot=${CMAKE_SYSROOT}")



# # pkg-config (you need a pkg-config.exe in PATH e.g. from MSYS2)
# set(ENV{PKG_CONFIG_DIR} "")
# set(ENV{PKG_CONFIG_SYSROOT_DIR} "${CMAKE_SYSROOT}")
