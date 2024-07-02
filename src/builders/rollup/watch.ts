import { relative } from "pathe";
import { watch as _rollupWatch } from "rollup";
import type { RollupOptions } from "../../types";
import consola from "consola";
import chalk from "chalk";

export function rollupWatch(rollupOptions: RollupOptions) {
  const watcher = _rollupWatch(rollupOptions);

  let inputs: string[];
  if (Array.isArray(rollupOptions.input)) {
    inputs = rollupOptions.input;
  } else if (typeof rollupOptions.input === "string") {
    inputs = [rollupOptions.input];
  } else {
    inputs = Object.keys(rollupOptions.input || {});
  }
  consola.info(
    `[unbuild] [rollup] Starting watchers for entries: ${inputs.map((input) => "./" + relative(process.cwd(), input)).join(", ")}`,
  );

  consola.warn(
    "[unbuild] [rollup] Watch mode is experimental and may be unstable",
  );

  watcher.on("change", (id, { event }) => {
    consola.info(`${chalk.cyan(relative(".", id))} was ${event}d`);
  });

  watcher.on("restart", () => {
    consola.info(chalk.gray("[unbuild] [rollup] Rebuilding bundle"));
  });

  watcher.on("event", (event) => {
    if (event.code === "END") {
      consola.success(chalk.green("[unbuild] [rollup] Rebuild finished\n"));
    }
  });
}
