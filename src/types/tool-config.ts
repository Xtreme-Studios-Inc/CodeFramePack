export interface Resource {
  downloadUrl: string;
}

export interface Toolchain {
  dockerFile: string;
  triplet: string;
}

export interface ScaffoldRule {
  /** The source directory path (relative to root) */
  from: string;

  /** The destination directory path */
  to: string;

  /**
   * Optional: Only copy files matching these patterns.
   * If omitted, defaults to "**\/*" (everything).
   * Example: ["*.json", "dist/app.js"]
   */
  include?: string[];

  /**
   * Optional: Do NOT copy files matching these patterns.
   * Priority: Excludes usually override Includes.
   * Example: ["node_modules", "**\/*.test.ts"]
   */
  exclude?: string[];

  /**
   * Optional: If true, puts all files directly in 'to',
   * ignoring their original folder structure.
   */
  flatten?: boolean;

  rename?: Record<string, string>;
}

export interface ToolchainScaffoldConfig {
  rules: ScaffoldRule[];
}
