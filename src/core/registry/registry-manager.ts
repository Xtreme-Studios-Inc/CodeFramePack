import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Result } from "../types";
import type { LibStatus, Registry } from "../types/registry.types";

const REGISTRY_PATH = join(process.cwd(), "registry.json");

// // A default "Skipped" result for steps that didn't run due to previous failures
// export const SKIPPED_RESULT: Result = {
//   success: false,
//   code: -1,
//   error: "Step skipped due to previous failure",
// };

export class RegistryManager {
  private registry: Registry;
  private path: string;

  constructor(filePath: string = REGISTRY_PATH) {
    this.path = filePath;
    this.registry = this.load();
  }

  private load(): Registry {
    if (!existsSync(this.path)) {
      return { libraryStatus: {} };
    }
    try {
      const data = readFileSync(this.path, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse registry, starting fresh.", e);
      return { libraryStatus: {} };
    }
  }

  /**
   * Updates the status in memory only. Does NOT write to disk.
   */
  public updateStatus(libName: string, target: string, status: LibStatus) {
    if (!this.registry.libraryStatus[libName]) {
      this.registry.libraryStatus[libName] = {};
    }
    this.registry.libraryStatus[libName][target] = status;
  }

  /**
   * Persists the current in-memory state to the JSON file.
   * Call this only after a library is fully processed.
   */
  public save() {
    try {
      writeFileSync(this.path, JSON.stringify(this.registry, null, 2));
      // console.log("💾 Registry updated.");
    } catch (e) {
      console.error("❌ Failed to save registry:", e);
    }
  }

  public getRegistry(): Registry {
    return this.registry;
  }
}
