import { describe, it, expect } from "vitest";
import { build } from "../src";
import { resolve } from "pathe";
import { fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import { type ESMExport, findExports, findTypeExports } from "mlly";

describe("Node10 and Node16 Default Exports Types", () => {
  const dtsFiles = /\.d\.(c)?ts$/;

  async function readDtsFiles(
    dist: string,
  ): Promise<[name: string, types: ESMExport[], exports: ESMExport[]][]> {
    const files = await readdir(dist).then((files) =>
      files.filter((f) => dtsFiles.test(f)).map((f) => [f, resolve(dist, f)]),
    );
    return await Promise.all(
      files.map(async ([name, path]) => {
        const content = await readFile(path, "utf8");
        return [name, findTypeExports(content), findExports(content)];
      }),
    );
  }

  it("Mixed Declaration Types", async () => {
    const root = resolve(
      fileURLToPath(import.meta.url),
      "../cjs-types-fixture/mixed-declarations",
    );
    await build(root, false);
    const files = await readDtsFiles(resolve(root, "dist"));
    expect(files).toHaveLength(2);
    for (const [name, types, exports] of files) {
      expect(exports).toHaveLength(0);
      expect(types).toHaveLength(1);
      expect(
        types.find((e) => e.names.includes("default")),
        `${name} should not have a default export`,
      ).toBeUndefined();
    }
    expect(files).toMatchSnapshot();
  });

  it("Re-Export Types", async () => {
    const warnings: string[] = [];
    const root = resolve(
      fileURLToPath(import.meta.url),
      "../cjs-types-fixture/reexport-types",
    );
    await build(root, false, {
      hooks: {
        "rollup:options": (_, options) => {
          const _onwarn = options.onwarn;
          // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
          options.onwarn = (warning, handler) => {
            if (warning.code === "EMPTY_BUNDLE") {
              warnings.push(warning.message);
              return;
            }
            return _onwarn?.(warning, handler);
          };
        },
      },
    });
    expect(warnings).toHaveLength(2);
    expect(warnings[0]).toBe('Generated an empty chunk: "types".');
    expect(warnings[1]).toBe('Generated an empty chunk: "types".');
    const files = await readDtsFiles(resolve(root, "dist"));
    expect(files).toHaveLength(4);
    for (const [name, types, exports] of files) {
      if (name.startsWith("types")) {
        expect(exports).toHaveLength(0);
        expect(types).toHaveLength(1);
        expect(
          types.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
      } else {
        expect(exports).toHaveLength(2);
        expect(types).toHaveLength(0);
        expect(
          exports.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
      }
    }
    expect(files).toMatchSnapshot();
  });
});
