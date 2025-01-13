import type { Options } from "./types";

export type * from "./types";

export default function plugin(options: Options = {}): Options {
  return options;
}
