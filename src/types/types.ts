import type { Repositories } from "../types/package-config.ts";
import type { Toolchain } from "./tool-config.ts";

export interface CFPackConfig {
  repositories: Repositories;
  toolchains: Toolchain[];
}
