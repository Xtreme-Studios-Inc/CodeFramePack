import { platform, arch } from "node:process";

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

export function getCompilerPath() {
  // Normalize the Architecture name
  // Node gives us "x64" or "arm64", but your folders use "x86_64" and "aarch64"
  const currentArch = arch === "x64" ? "x86_64" : "aarch64";

  let root = "";

  switch (platform) {
    case "win32":
      root = "D:/ProgramFiles/CodeFrame/dependencies/cpp/windows";
      break;
    case "darwin": // macOS
      root = "/opt/CodeFrame/dependencies/cpp/macos";
      break;
    case "linux":
    default:
      root = "/opt/CodeFrame/dependencies/cpp/linux";
      break;
  }

  // Construct and return the full path
  // Result: .../cpp/<os>/<arch>/bin
  return `${root}/${currentArch}/bin`;
}
