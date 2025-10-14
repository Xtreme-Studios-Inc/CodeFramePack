export const OUTPUT_DIR = "../../packages_TEST/cpp-packages";

// For the script to work user has to define:
// export let builds: BuildArchitectures = {[CUSTOM CONFIG GOES HERE]};

export type Cmd = string | string[];

export interface BuildConfig {
  configStep: Cmd;
  buildStep: Cmd;
  installStep: Cmd;
}
export interface BuildArchitectures {
  windows_x86_64: BuildConfig;
  windows_aarch64: BuildConfig;
}
