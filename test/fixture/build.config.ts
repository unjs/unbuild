import { defineBuildConfig } from "../../src";

export default defineBuildConfig([
  {
    preset: "./build.preset",
    rollup: {
      emitCJS: true,
    },
    entries: [
      "src/index",
      { input: "src/runtime/", outDir: "dist/runtime" },
      { input: "src/schema", builder: "untyped" },
    ],
  },
  /**
   * On top of that we run another build with a different config.
   */
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
