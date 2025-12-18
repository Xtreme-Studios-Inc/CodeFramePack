import type {
  DockerResource,
  SysrootScaffoldConfig,
} from "../../core/types/tool.types";

export const dockerResources: Record<string, DockerResource> = {
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

export const sysrootScaffoldConfig: Record<string, SysrootScaffoldConfig> = {
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
      },
      {
        from: "linux.x86_64/lib/clang",
        to: "lib/clang",
      },
      {
        from: "linux.x86_64.sysroot/usr",
        to: "",
        substitutions: {
          "lib/x86_64-linux-gnu/libc.so": `/* GNU ld script
       Use the shared library, but some functions are only in
       the static library, so try that secondarily.  */
    OUTPUT_FORMAT(elf64-x86-64)
    GROUP ( libc.so.6 libc_nonshared.a  AS_NEEDED ( ld-linux-x86-64.so.2 ) )`,
          "lib/x86_64-linux-gnu/libm.so": `/* GNU ld script
  */
  OUTPUT_FORMAT(elf64-x86-64)
  GROUP ( libm.so.6  AS_NEEDED ( libmvec.so.1 ) )`,
        },
        exclude: ["include/c++/v1"],
      },
      {
        from: "linux.x86_64/include",
        to: "include",
        exclude: ["x86_64-unknown-linux-gnu"],
      },
      {
        from: "linux.x86_64/include/x86_64-unknown-linux-gnu/c++/v1",
        to: "include/c++/v1",
      },
    ],
  },
  "linux.aarch64": {
    rules: [
      {
        from: "linux.aarch64/bin",
        to: "bin",
        exclude: LINUX_BINARY_EXCLUSIONS,
      },
      {
        from: "linux.aarch64/lib/clang",
        to: "lib/clang",
      },
      {
        from: "linux.aarch64.sysroot/usr",
        to: "",
        substitutions: {
          "lib/aarch64-linux-gnu/libc.so": `/* GNU ld script */
OUTPUT_FORMAT(elf64-littleaarch64)
GROUP ( libc.so.6 libc_nonshared.a  AS_NEEDED ( ld-linux-aarch64.so.1 ) )`,
          "lib/aarch64-linux-gnu/libm.so": `/* GNU ld script
*/
OUTPUT_FORMAT(elf64-littleaarch64)
GROUP ( libm.so.6  AS_NEEDED ( libmvec.so.1 ) )`,
        },
        exclude: ["include/c++/v1"],
      },
      {
        from: "linux.aarch64/include",
        to: "include",
      },
    ],
  },
};
