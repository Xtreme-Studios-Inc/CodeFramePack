import { spawn } from "bun";
import { platform } from "process";
import type { Cmd } from "./types/package-config";
import { BOLD, DARK_GREEN, RESET } from "./types/theme";

function toSpawnCmd(cmd: Cmd): string[] {
  if (Array.isArray(cmd)) return cmd; // no shell
  // use a shell so quotes/&&/env vars work
  return platform === "win32"
    ? ["cmd.exe", "/d", "/s", "/c", cmd]
    : ["bash", "-lc", cmd];
}

export async function run(
  cmd: Cmd,
  label?: string,
  opts: { cwd?: string } = {}
) {
  if (label) console.log(`${BOLD}${DARK_GREEN} ${label}${RESET}`);
  //   console.log("Command: ");
  //   console.log(cmd);
  //   console.log("- Started -");

  try {
    const p = spawn({
      cmd: toSpawnCmd(cmd),
      cwd: opts.cwd,
      stdout: "inherit",
      stderr: "inherit",
    });

    const code = await p.exited;

    if (code !== 0) {
      console.error(`✗ ${label ?? "Command"} failed with exit code ${code}`);
      return { code, success: false };
    }

    return { code, success: true };
  } catch (err) {
    console.error(`✗ ${label ?? "Command"} threw`, err);
    return { code: -1, success: false, error: err };
  }
}
