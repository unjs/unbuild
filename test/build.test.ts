import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../src/index.js";

type BuildConfig = Parameters<typeof build>[2];

describe("Build fixtures", () => {
  const tests: [string, BuildConfig & { dir: string }][] = [
    [
      "declaration (mkdist)",
      {
        dir: "fixtures/mkdist-declaration",
      },
    ],
    [
      "sourcemap (mkdist)",
      {
        dir: "fixtures/mkdist-sourcemap",
      },
    ],
    [
      "declaration (rollup)",
      {
        dir: "fixtures/rollup-declaration",
      },
    ],
    [
      "sourcemap (rollup)",
      {
        dir: "fixtures/rollup-sourcemap",
      },
    ],
  ];

  it.each(tests)("%s", async (_, { dir, ...buildOptions }) => {
    const cwd = new URL(dir.replace(/\/?$/, "/"), import.meta.url);
    await build(fileURLToPath(cwd), false, buildOptions);
    for (const file of fs.readdirSync(new URL("dist/", cwd), {
      recursive: true,
      withFileTypes: true,
    })) {
      if (file.isFile()) {
        expect(
          fs.readFileSync(path.join(file.parentPath, file.name), "utf8"),
        ).toMatchSnapshot(file.name);
      }
    }
  });
});
