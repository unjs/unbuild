import { defineBuildConfig } from "../../src";

export default defineBuildConfig({
  preset: "./build.preset",
  rollup: {
    emitCJS: true,
    esbuild: {
      // This option does not have any effect for now， but the build process should pass
      tsconfig: false,
    },
  },
  entries: [
    "src/index",
    { input: "src/runtime/", outDir: "dist/runtime" },
    { input: "src/schema", builder: "untyped" },
  ],
});
