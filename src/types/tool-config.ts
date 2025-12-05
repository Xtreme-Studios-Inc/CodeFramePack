export interface Resource {
  downloadUrl: string;
}

export interface DockerResource {
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

  /**
   * Optional: Overwrite specific files with new string content.
   * Key: The relative path of the file (inside the 'to' folder).
   * Value: The raw string content to write instead of the source file.
   */
  substitutions?: Record<string, string>;
}

export interface SysrootScaffoldConfig {
  rules: ScaffoldRule[];
}
