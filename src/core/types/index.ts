import type { Repositories } from "./package.types.ts";
import type {
  DockerResource,
  Resource,
  SysrootScaffoldConfig,
} from "./tool.types.ts";

export interface CFPackConfig {
  repositories: Repositories;
  resources: Record<string, Resource>;
  dockerResources: Record<string, DockerResource>;
  sysrootScaffoldConfig: Record<string, SysrootScaffoldConfig>;
}

export * from "./package.types.ts";
export * from "./tool.types.ts";
