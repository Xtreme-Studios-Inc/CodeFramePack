import { spawn } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import type { Repositories } from "../types/package-config";

// Target Directory where repositories would be cloned to.
const LIB_SOURCES_DIR = path.resolve(process.cwd(), "./lib-sources");

// Spawns a Git command and streams its output.
function runGitCommand(args: string[], cwd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Using { stdio: 'inherit' } pipes the child's stdin, stdout, and stderr
    // directly to the parent process, so you see the git output in real-time.
    const git = spawn("git", args, { cwd, stdio: "inherit" });

    git.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Git command failed with code ${code}: git ${args.join(" ")}`
          )
        );
      }
    });

    git.on("error", (err) => {
      reject(err);
    });
  });
}

/**
 * Asynchronously checks if a directory exists.
 */
async function dirExists(dirPath: string): Promise<boolean> {
  try {
    await fs.stat(dirPath);
    return true;
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error; // Re-throw other errors
  }
}

/**
 * Implements the clone-or-pull logic from the bash script.
 * @param repoUrl The full URL of the repository.
 * @param destDir The directory to clone *into* (e.g., "./lib-sources" or "./lib-sources/vulkan")
 */
async function cloneOrPull(repoUrl: string, destDir: string) {
  const repoName = path.basename(repoUrl, ".git");
  const repoPath = path.join(destDir, repoName);
  const gitDir = path.join(repoPath, ".git");

  console.log(`→ ${repoName}`);

  if (await dirExists(gitDir)) {
    console.log(`   exists → pulling latest…`);
    // Use `repoPath` as the CWD for `git pull`
    await runGitCommand(["pull", "--ff-only"], repoPath);
  } else {
    console.log(`   cloning into ${repoPath}`);
    // Clone into the `repoPath` directory.
    // The CWD for the clone command itself doesn't matter much since we provide absolute paths.
    await runGitCommand(
      ["clone", "--recurse-submodules", "--depth", "1", repoUrl, repoPath],
      process.cwd()
    );
  }
}

/**
 * Clones or pulls all defined repositories into the `lib-sources` directory.
 */
export async function cloneRepos(repos: Repositories) {
  console.log(`--- Cloning/Pulling Repositories into ${LIB_SOURCES_DIR} ---`);

  try {
    // Ensure the main lib-sources directory exists, (equiv. of `mkdir -p`)
    await fs.mkdir(LIB_SOURCES_DIR, { recursive: true });

    // --- Clone Normal Repos ---
    console.log("\n--- Processing standard repos ---");
    for (const repoUrl of repos.other) {
      try {
        await cloneOrPull(repoUrl, LIB_SOURCES_DIR);
      } catch (error) {
        console.error(`[Failed] Could not process ${repoUrl}:\n`, error);
      }
    }

    // --- Clone Grouped Repos ---
    console.log("\n--- Processing grouped repos ---");
    // Refactored loop to work with the new object structure
    for (const [group, groupRepos] of Object.entries(repos.groups)) {
      if (!groupRepos || groupRepos.length === 0) continue;

      const groupDir = path.join(LIB_SOURCES_DIR, group);

      try {
        // Ensure the group subdirectory exists
        await fs.mkdir(groupDir, { recursive: true });

        // Process each repo in the group
        for (const repoUrl of groupRepos) {
          try {
            await cloneOrPull(repoUrl, groupDir);
          } catch (error) {
            console.error(
              `[Failed] Could not process ${repoUrl} (group ${group}):\n`,
              error
            );
          }
        }
      } catch (error) {
        console.error(
          `[Failed] Could not create directory for group ${group}:\n`,
          error
        );
      }
    }

    console.log("\n✅ Done processing all repositories.");
  } catch (error) {
    console.error("A fatal error occurred during clone-all:", error);
  }
}
