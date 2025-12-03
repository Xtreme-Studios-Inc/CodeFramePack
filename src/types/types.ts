import type { Repositories } from "../types/package-config.ts";
import type {
  Toolchain,
  Resource,
  ToolchainScaffoldConfig,
} from "./tool-config.ts";

export interface CFPackConfig {
  repositories: Repositories;
  resources: Record<string, Resource>;
  toolchains: Record<string, Toolchain>;
  toolchainScafoldConfig: Record<string, ToolchainScaffoldConfig>;
}
