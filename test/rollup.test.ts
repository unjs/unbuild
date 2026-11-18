import { promises as fsp } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { join, resolve } from "pathe";
import { afterEach, describe, expect, it } from "vitest";
import { build } from "../src/build";
import { getRollupOptions } from "../src/builders/rollup/config";
import type { BuildContext } from "../src/types";

const tempDirs: string[] = [];

async function createTempDir(): Promise<string> {
  const dir = await fsp.mkdtemp(join(tmpdir(), "unbuild-rollup-test-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(
    tempDirs
      .splice(0)
      .map((dir) => fsp.rm(dir, { recursive: true, force: true })),
  );
});

describe("rollup preserveDynamicImports", () => {
  it("resolves default and named exports from dynamically imported internal chunks in CJS and ESM", async () => {
    const rootDir = await createTempDir();
    await fsp.mkdir(join(rootDir, "src"), { recursive: true });

    await fsp.writeFile(
      join(rootDir, "package.json"),
      JSON.stringify({
        name: "demo-internal-dynamic-import",
        version: "1.0.0",
        type: "module",
      }),
      "utf8",
    );

    await fsp.writeFile(
      join(rootDir, "src/plugin.ts"),
      [
        'export default function plugin(): string { return "plugin ran"; }',
        "export const version = 1;",
      ].join("\n"),
      "utf8",
    );

    await fsp.writeFile(
      join(rootDir, "src/default-only.ts"),
      'export default function defaultOnly(): string { return "default only"; }\n',
      "utf8",
    );

    await fsp.writeFile(
      join(rootDir, "src/index.ts"),
      [
        "export async function getPlugin(): Promise<{ defaultExport: () => string; version: number }> {",
        '  const mod = await import("./plugin");',
        "  return { defaultExport: mod.default, version: mod.version };",
        "}",
        "export async function getDefaultOnly(): Promise<() => string> {",
        '  const mod = await import("./default-only");',
        "  return mod.default;",
        "}",
      ].join("\n"),
      "utf8",
    );

    await build(rootDir, false, {
      entries: ["src/index"],
      declaration: false,
      rollup: {
        emitCJS: true,
      },
    });

    const cjsPath = resolve(rootDir, "dist/index.cjs");
    const mjsPath = resolve(rootDir, "dist/index.mjs");
    const cjsCode = await fsp.readFile(cjsPath, "utf8");
    const mjsCode = await fsp.readFile(mjsPath, "utf8");

    expect(cjsCode).toContain("require('./chunks/plugin.cjs')");
    expect(cjsCode).not.toContain("import('./chunks/plugin.cjs')");
    expect(mjsCode).toContain("import('./chunks/plugin.mjs')");

    const req = createRequire(import.meta.url);
    const cjsEntry = req(cjsPath) as {
      getPlugin: () => Promise<{
        defaultExport: () => string;
        version: number;
      }>;
      getDefaultOnly: () => Promise<() => string>;
    };
    const cjsPlugin = await cjsEntry.getPlugin();
    expect(typeof cjsPlugin.defaultExport).toBe("function");
    expect(cjsPlugin.defaultExport()).toBe("plugin ran");
    expect(cjsPlugin.version).toBe(1);

    const cjsDefaultOnly = await cjsEntry.getDefaultOnly();
    expect(typeof cjsDefaultOnly).toBe("function");
    expect(cjsDefaultOnly()).toBe("default only");

    const esmEntry = (await import(pathToFileURL(mjsPath).href)) as {
      getPlugin: () => Promise<{
        defaultExport: () => string;
        version: number;
      }>;
      getDefaultOnly: () => Promise<() => string>;
    };
    const esmPlugin = await esmEntry.getPlugin();
    expect(typeof esmPlugin.defaultExport).toBe("function");
    expect(esmPlugin.defaultExport()).toBe("plugin ran");
    expect(esmPlugin.version).toBe(1);

    const esmDefaultOnly = await esmEntry.getDefaultOnly();
    expect(typeof esmDefaultOnly).toBe("function");
    expect(esmDefaultOnly()).toBe("default only");
  });

  it("preserves external dynamic imports in CJS output even when dynamicImportInCjs is false", async () => {
    const rootDir = await createTempDir();
    const extPkgDir = join(rootDir, "node_modules/ext-esm-pkg");
    await fsp.mkdir(join(rootDir, "src"), { recursive: true });
    await fsp.mkdir(extPkgDir, { recursive: true });

    await fsp.writeFile(
      join(extPkgDir, "package.json"),
      JSON.stringify({
        name: "ext-esm-pkg",
        version: "1.0.0",
        type: "module",
        exports: "./index.mjs",
      }),
      "utf8",
    );
    await fsp.writeFile(
      join(extPkgDir, "index.mjs"),
      'const value = await Promise.resolve("esm-top-level-await");\nexport default value;\n',
      "utf8",
    );

    await fsp.writeFile(
      join(rootDir, "package.json"),
      JSON.stringify({
        name: "demo-external-dynamic-import",
        version: "1.0.0",
        type: "module",
        dependencies: {
          "ext-esm-pkg": "^1.0.0",
        },
      }),
      "utf8",
    );

    await fsp.writeFile(
      join(rootDir, "src/index.ts"),
      [
        "export async function loadExternal(): Promise<string> {",
        '  const mod = await import("ext-esm-pkg");',
        "  return mod.default;",
        "}",
      ].join("\n"),
      "utf8",
    );

    await build(rootDir, false, {
      entries: ["src/index"],
      declaration: false,
      rollup: {
        emitCJS: true,
        output: {
          dynamicImportInCjs: false,
        },
      },
    });

    const cjsPath = resolve(rootDir, "dist/index.cjs");
    const cjsCode = await fsp.readFile(cjsPath, "utf8");

    expect(cjsCode).toContain("import('ext-esm-pkg')");
    expect(cjsCode).not.toContain("require('ext-esm-pkg')");

    const req = createRequire(import.meta.url);
    const cjsEntry = req(cjsPath) as {
      loadExternal: () => Promise<string>;
    };
    expect(await cjsEntry.loadExternal()).toBe("esm-top-level-await");
  });

  it("distinguishes internal modules from external and unresolved targets via getModuleInfo", () => {
    const options = getRollupOptions({
      pkg: { name: "demo" },
      warnings: new Set(),
      options: {
        name: "demo",
        rootDir: ".",
        outDir: "dist",
        sourcemap: false,
        entries: [],
        externals: [],
        alias: {},
        replace: {},
        rollup: {
          emitCJS: true,
          preserveDynamicImports: true,
          cjsBridge: false,
          inlineDependencies: false,
          output: {},
          replace: false,
          alias: false,
          resolve: false,
          json: false,
          esbuild: false,
          commonjs: false,
          dts: {},
        },
      },
    } as unknown as BuildContext);

    const plugin = options.plugins.find(
      (p) => p.name === "unbuild=preserve-dynamic-imports",
    );
    expect(plugin).toBeDefined();

    const renderHook =
      typeof plugin!.renderDynamicImport === "function"
        ? plugin!.renderDynamicImport
        : undefined;
    expect(renderHook).toBeTypeOf("function");

    const mockContext = {
      getModuleInfo(id: string): { isExternal: boolean } | null {
        if (id === "/app/src/internal.ts") {
          return { isExternal: false };
        }
        if (id === "ext-pkg") {
          return { isExternal: true };
        }
        return null;
      },
    };

    const baseHookArgs = {
      format: "cjs" as const,
      moduleId: "/app/src/index.ts",
      customResolution: null,
      chunk: {} as never,
      targetChunk: null,
      getTargetChunkImports: (): null => null,
      targetModuleAttributes: {},
    };

    expect(
      renderHook!.call(mockContext as never, {
        ...baseHookArgs,
        targetModuleId: "/app/src/internal.ts",
      }),
    ).toBeNull();

    expect(
      renderHook!.call(mockContext as never, {
        ...baseHookArgs,
        targetModuleId: "ext-pkg",
      }),
    ).toEqual({ left: "import(", right: ")" });

    expect(
      renderHook!.call(mockContext as never, {
        ...baseHookArgs,
        targetModuleId: null,
      }),
    ).toEqual({ left: "import(", right: ")" });
  });
});
