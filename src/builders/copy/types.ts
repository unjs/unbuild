import type { BaseBuildEntry, BuildContext } from "../../types";
import type { GlobOptions } from 'tinyglobby'

export interface CopyBuildEntry extends BaseBuildEntry {
  builder: "copy";
  pattern?: string | string[];
}

export interface CopyHooks {
  "copy:entries": (
    ctx: BuildContext,
    entries: CopyBuildEntry[],
  ) => void | Promise<void>;
  "copy:entry:options": (
    ctx: BuildContext,
    entry: CopyBuildEntry,
    options: GlobOptions,
  ) => void | Promise<void>;
  "copy:done": (ctx: BuildContext) => void | Promise<void>;
}
