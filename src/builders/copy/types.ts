import type { BaseBuildEntry, BuildContext } from "../../types";

export interface CopyBuildEntry extends BaseBuildEntry {
  builder: "copy";
  pattern?: string | string[];
}

export interface CopyHooks {
  "copy:entries": (
    ctx: BuildContext,
    entries: CopyBuildEntry[],
  ) => void | Promise<void>;
  "copy:done": (ctx: BuildContext) => void | Promise<void>;
}
