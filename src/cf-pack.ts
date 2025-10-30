import { argv } from "node:process";

import { runPackageActions } from "./commands/packages";
import { BOLD, MAGENTA, RESET } from "./types/theme";
import { config } from "./config/config";
import { cloneRepos } from "./commands/clone-all";
import { setup } from "./commands/setup";
import { rm } from "node:fs/promises";

async function main(cmd: string) {
  switch (cmd) {
    case "setup":
      await setup(config.toolchains);
      break;
    case "clone-all":
      await cloneRepos(config.repositories);
      break;
    case "build-all":
      await runPackageActions("build", "./lib-sources");
      break;
    case "clean-all":
      await runPackageActions("clean", "./lib-sources");
      await rm("build/generated-packages", { recursive: true, force: true });
      break;
    case "clean-tools":
      console.log("Would Clean Tools");
      break;
    case "help":
      console.log(
        `${BOLD}${MAGENTA}------- Help -------${RESET}\n`,
        `${BOLD}${MAGENTA}setup:${RESET} downloads all dependencies\n`,
        `${BOLD}${MAGENTA}clone-all:${RESET} clone all library sources\n`,
        `${BOLD}${MAGENTA}build-all:${RESET} builds all packages\n`,
        `${BOLD}${MAGENTA}clean-all:${RESET} cleans all all package build directories\n`,
        `${BOLD}${MAGENTA}clean-tools:${RESET} cleans out dependencies\n`
      );
      break;
    default:
      console.log(`Command ${cmd} does not exist in CodeFramePackages`);
      break;
  }
}

const args = argv.slice(2);
const [cmd = "help"] = args;

main(cmd);
