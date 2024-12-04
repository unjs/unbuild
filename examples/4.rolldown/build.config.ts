import { defineBuildConfig } from "../../src";

export default defineBuildConfig({
  entries: [
    "src/index.ts",
  ],
  declaration: true,
  experimental: {
    rolldown: true,
  },
  rollup: {
    emitCJS: true,
  },
});
