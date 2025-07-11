import { describe, it } from "vitest";
import { defineBuildConfig } from "../src";

describe("types", () => {
  it("defineBuildConfig - parameters should be type-safe", () => {
    defineBuildConfig({
      entries: [
        "src/index.ts",

        { input: "src/index.ts" },
        // @ts-expect-error "declaration" shouldn't be allowed when no builder is specified
        { input: "src/index.ts", declaration: true },

        { input: "src/index.ts", builder: "rollup" },
        // @ts-expect-error "declaration" shouldn't be allowed with "rollup" builder
        {
          input: "src/index.ts",
          builder: "rollup",
          declaration: true,
        },
        {
          input: "src/index.ts",
          builder: "mkdist",
        },
        {
          input: "src/index.ts",
          builder: "mkdist",
          declaration: true,
        },

        {
          input: "src/index.ts",
          builder: "untyped",
        },
        {
          input: "src/index.ts",
          builder: "untyped",
          declaration: true,
        },

        {
          input: "src/index.ts",
          builder: "copy",
        },
        // @ts-expect-error "declaration" shouldn't be allowed with "copy" builder
        {
          input: "src/index.ts",
          builder: "copy",
          declaration: true,
        },
      ],
    });
  });
});
