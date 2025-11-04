export const OUTPUT_DIR = "../../../build/generated-packages/cpp-packages";

// For the script to work user has to define:
// export let builds: BuildArchitectures = {[CUSTOM CONFIG GOES HERE]};

export type Cmd = string | string[];

export interface BuildConfig {
  configStep: Cmd;
  buildStep: Cmd;
  installStep: Cmd;
}
export interface BuildArchitectures {
  readonly type: "architectures";
  windows_x86_64: BuildConfig;
  windows_aarch64: BuildConfig;
  linux_x86_64: BuildConfig;
  linux_aarch64: BuildConfig;
}

export interface HeaderList {
  readonly type: "headers";
  libs: Record<string, string[]>;
}

export type BuildType = BuildArchitectures | HeaderList;

// Library Types
export interface LibGroups {
  [key: string]: string[];
}
export interface Repositories {
  groups: LibGroups;
  other: string[];
}
