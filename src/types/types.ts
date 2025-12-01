import type { Repositories } from "../types/package-config.ts";
import type { Toolchain, Resource } from "./tool-config.ts";

export interface CFPackConfig {
  repositories: Repositories;
  resources: Resource[];
  toolchains: Toolchain[];
}
