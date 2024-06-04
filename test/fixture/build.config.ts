import { defineBuildConfig } from "../../src";

export default defineBuildConfig([
  // Auto preset
  {},
  // Custom preset
  {
    preset: "./build.preset",
    rollup: {
      emitCJS: true,
    },
    entries: [
      "./src/index.ts",
      "./src/nested/subpath.ts",
      { input: "src/runtime/", outDir: "dist/runtime" },
      { input: "src/", outDir: "dist/json/", builder: "copy", pattern: "**/*.json" },
      { input: "src/schema", builder: "untyped" },
    ],
  },
  // Minified with sourcemaps
  {
    name: "minified",
    entries: ["src/index"],
    outDir: "dist/min",
    sourcemap: true,
    declaration: true,
    rollup: {
      esbuild: {
        minify: true,
      },
    },
  },
]);
