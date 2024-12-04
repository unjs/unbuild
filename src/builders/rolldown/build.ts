import { rolldown } from 'rolldown';
import type { BuildContext } from "../../types";
import { getRolldownOptions } from "./config";
import { warn } from '../../utils';

/**
 * TODO: add description
 * @param ctx 
 */
export async function rolldownBuild(ctx: BuildContext): Promise<void> {
  /** Print warning that rolldown is still a experimental feature */
  warn(
    ctx,
    "You are using an experimental feature [rolldown], please report any issues you encounter.",
  );

  /** Define entries */
  const entries = ctx.options.entries.filter(
    (e) => e.builder === "rolldown",
  );

  if (entries.length === 0) {
    return;
  }

  /** Define build options */
  const rolldownConfig = getRolldownOptions(ctx);

  /**
   * Make rolldown build - we need to do that in a loop because we cannot have multiple outputs
   * @see https://github.com/rolldown/rolldown/blob/main/packages/rolldown/src/cli/commands/bundle.ts#L24
   */
  for (const entry of rolldownConfig) {
    const bundler = await rolldown(entry);
    await bundler.write(entry.output)
  }
}