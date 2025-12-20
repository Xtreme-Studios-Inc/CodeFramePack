import type { Result } from "../types";

export type CompilationBuildStatus = {
  type: "compilation";
  config: Result;
  build: Result;
  install: Result;
  timestamp?: number;
  version?: string;
};

export type CollectionBuildStatus = {
  type: "collection";
  install: Result;
  validation?: Result;
  timestamp?: number;
  version?: string;
};

export type LibStatus = CompilationBuildStatus | CollectionBuildStatus;

export interface Registry {
  libraryStatus: Record<string, Record<string, LibStatus>>;
}
