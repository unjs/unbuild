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
      { input: "src/schema", builder: "untyped" },
    ],
  },
  // Minified
  {
    name: "minified",
    entries: ["src/index"],
    outDir: "dist/min",
    rollup: {
      esbuild: {
        minify: true,
      },
    },
  },
]);
