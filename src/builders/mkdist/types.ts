import type { MkdistOptions } from "mkdist";
import type { BuildContext, BaseBuildEntry } from "../../types";

export interface MkdistBuildEntry
  extends Omit<BaseBuildEntry, "declaration">,
    MkdistOptions {
  builder: "mkdist";
}

export interface MkdistHooks {
  "mkdist:entries": (
    ctx: BuildContext,
    entries: MkdistBuildEntry[],
  ) => void | Promise<void>;
  "mkdist:entry:options": (
    ctx: BuildContext,
    entry: MkdistBuildEntry,
    options: MkdistOptions,
  ) => void | Promise<void>;
  "mkdist:entry:build": (
    ctx: BuildContext,
    entry: MkdistBuildEntry,
    output: { writtenFiles: string[] },
  ) => void | Promise<void>;
  "mkdist:done": (ctx: BuildContext) => void | Promise<void>;
}
