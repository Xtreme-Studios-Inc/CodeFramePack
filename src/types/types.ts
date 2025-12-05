import type { Repositories } from "../types/package-config.ts";
import type {
  DockerResource,
  Resource,
  SysrootScaffoldConfig,
} from "./tool-config.ts";

export interface CFPackConfig {
  repositories: Repositories;
  resources: Record<string, Resource>;
  dockerResources: Record<string, DockerResource>;
  sysrootScaffoldConfig: Record<string, SysrootScaffoldConfig>;
}
