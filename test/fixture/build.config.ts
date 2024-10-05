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
      "./src/index.mts",
      "./src/nested/subpath.ts",
      { input: "src/runtime/", outDir: "dist/runtime" },
      {
        input: "src/",
        outDir: "dist/json/",
        builder: "copy",
        pattern: "**/*.json",
      },
      { input: "src/schema", builder: "untyped" },
    ],
    stubOptions: {
      jiti: {
        transformOptions: {
          babel: {
            // @ts-expect-error - type complexity
            plugins: [["@babel/plugin-transform-class-properties"]],
          },
        },
      },
    },
  },
  // Minified with sourcemaps
  {
    name: "minified",
    entries: ["src/index"],
    outDir: "dist/min",
    sourcemap: true,
    declaration: "compatible",
    rollup: {
      esbuild: {
        minify: true,
      },
    },
  },
]);
