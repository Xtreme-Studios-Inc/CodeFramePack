import path from "node:path";

export const PACKAGE_OUTPUT_DIR = path.resolve(
  process.cwd(),
  "./build/generated-packages"
);
export const PACKAGE_DIR = path.resolve(process.cwd(), "./packages");

export type Cmd = string | string[];

export interface BuildConfig {
  configStep: Cmd;
  buildStep: Cmd;
  installStep: Cmd;
}
export interface CompilationBuild {
  readonly type: "compilation";
  windows_x86_64?: BuildConfig;
  windows_aarch64?: BuildConfig;
  linux_x86_64?: BuildConfig;
  linux_aarch64?: BuildConfig;
}

export interface FileCollectionBuild {
  readonly type: "collection";
  libs: Record<string, string[]>;
}

export interface LibraryInfo {
  name: string;
  version: string;
  outDir: string;
}
export type BuildType = CompilationBuild | FileCollectionBuild;

export interface BuildConfiguration {
  info: LibraryInfo;
  build: BuildType;
}

// Library Types
export interface LibGroups {
  [key: string]: string[];
}
export interface Repositories {
  groups: LibGroups;
  other: string[];
}
