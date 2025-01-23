import { describe, it, expect } from "vitest";
import { build } from "../src";
import { resolve } from "pathe";
import { fileURLToPath } from "node:url";
import { readdir, readFile } from "node:fs/promises";
import {
  type ESMExport,
  findExports,
  findStaticImports,
  findTypeExports,
  parseStaticImport,
  type StaticImport,
} from "mlly";

describe("Node10 and Node16 Default Exports Types", () => {
  const dtsFiles = /\.d\.(c)?ts$/;

  async function readDtsFiles(
    dist: string,
  ): Promise<
    [
      name: string,
      types: ESMExport[],
      exports: ESMExport[],
      content: string,
      imports: StaticImport[],
    ][]
  > {
    const files = await readdir(dist).then((files) =>
      files.filter((f) => dtsFiles.test(f)).map((f) => [f, resolve(dist, f)]),
    );
    return await Promise.all(
      files.map(async ([name, path]) => {
        const content = await readFile(path, "utf8");
        return [
          name,
          findTypeExports(content),
          findExports(content),
          content,
          findStaticImports(content),
        ];
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
    expect(files).toHaveLength(6);
    for (const [name, types, exports, content, imports] of files) {
      if (name.startsWith("types")) {
        expect(exports).toHaveLength(0);
        expect(types).toHaveLength(1);
        expect(
          types.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
      } else if (name.startsWith("index")) {
        expect(exports).toHaveLength(2);
        expect(types).toHaveLength(0);
        expect(imports).toHaveLength(1);
        expect(
          exports.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
        expect(content).toMatch("export = plugin");
      } else if (name.startsWith("all")) {
        expect(exports).toHaveLength(2);
        expect(types).toHaveLength(0);
        expect(imports).toHaveLength(1);
        expect(
          exports.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
        const defaultImport = parseStaticImport(imports[0]);
        expect(defaultImport.defaultImport).toBe("_default");
        expect(content).toMatch(`export = ${defaultImport.defaultImport}`);
      }
    }
    expect(files).toMatchSnapshot();
  });

  it("Re-Export as default", async () => {
    const root = resolve(
      fileURLToPath(import.meta.url),
      "../cjs-types-fixture/reexport-default",
    );
    await build(root, false);
    const files = await readDtsFiles(resolve(root, "dist"));
    expect(files).toHaveLength(8);
    for (const [name, types, exports, content, imports] of files) {
      if (name.startsWith("asdefault")) {
        expect(exports).toHaveLength(0);
        expect(types).toHaveLength(0);
        expect(imports).toHaveLength(1);
        expect(
          types.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
        const defaultImport = parseStaticImport(imports[0]);
        expect(defaultImport.namedImports?.resolve).toBeDefined();
        expect(content).toMatch(`export = resolve`);
      } else if (name.startsWith("index")) {
        expect(exports).toHaveLength(1);
        expect(types).toHaveLength(0);
        expect(imports).toHaveLength(1);
        expect(
          exports.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
        const defaultImport = parseStaticImport(imports[0]);
        expect(defaultImport.defaultImport).toBe("MagicString");
        expect(content).toMatch(`export = ${defaultImport.defaultImport}`);
      } else if (name.startsWith("magicstringasdefault")) {
        expect(exports).toHaveLength(0);
        expect(types).toHaveLength(0);
        expect(imports.filter((i) => !!i.imports)).toHaveLength(1);
        expect(
          exports.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
        const defaultImport = parseStaticImport(imports[0]);
        expect(defaultImport.defaultImport).toBe("_default");
        expect(content).toMatch(`export = ${defaultImport.defaultImport}`);
      } else if (name.startsWith("resolvedasdefault")) {
        expect(exports).toHaveLength(0);
        expect(types).toHaveLength(0);
        expect(imports.filter((i) => !!i.imports)).toHaveLength(1);
        expect(
          exports.find((e) => e.names.includes("default")),
          `${name} should not have a default export`,
        ).toBeUndefined();
        const defaultImport = parseStaticImport(imports[0]);
        expect(defaultImport.defaultImport).toBe("resolve");
        expect(content).toMatch(`export = ${defaultImport.defaultImport}`);
      }
    }
    expect(files).toMatchSnapshot();
  });
});
