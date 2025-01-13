import type { Options } from "./types";

export type * from "./types";

export interface ResolvedOptions extends Options {
  name: string;
}

export default function plugin(options: Options = {}): ResolvedOptions {
  return {
    ...options,
    name: "plugin",
  };
}
