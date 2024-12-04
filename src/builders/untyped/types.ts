import type { Schema } from "untyped";
import type { BaseBuildEntry, BuildContext } from "../../types";

export interface UntypedBuildEntry extends BaseBuildEntry {
  builder: "untyped";
  defaults?: Record<string, any>;
}

export interface UntypedOutput {
  fileName: string;
  contents: string;
}

export interface UntypedOutputs {
  markdown: UntypedOutput;
  schema: UntypedOutput;
  defaults: UntypedOutput;
  declaration?: UntypedOutput;
}

export interface UntypedHooks {
  "untyped:entries": (
    ctx: BuildContext,
    entries: UntypedBuildEntry[],
  ) => void | Promise<void>;
  "untyped:entry:options": (
    ctx: BuildContext,
    entry: UntypedBuildEntry,
    options: any,
  ) => void | Promise<void>;
  "untyped:entry:schema": (
    ctx: BuildContext,
    entry: UntypedBuildEntry,
    schema: Schema,
  ) => void | Promise<void>;
  "untyped:entry:outputs": (
    ctx: BuildContext,
    entry: UntypedBuildEntry,
    outputs: UntypedOutputs,
  ) => void | Promise<void>;
  "untyped:done": (ctx: BuildContext) => void | Promise<void>;
}
