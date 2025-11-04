[llvm-mingw Release](https://github.com/mstorsjo/llvm-mingw/releases)

## Other

[llvm-project Release](https://github.com/llvm/llvm-project/releases)

## Linux Toolchains

To create the linux toolchains we run the following command that builds the docker containers and extracts them

```bash
./toolchains/cmake-tools/linux-sysroot.sh
```

Renaming of some files in the sysroot is still needed
