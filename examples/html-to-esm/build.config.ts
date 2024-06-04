import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  entries: ["src/index.html"],
  rollup: {
    output: {
      exports: "named",
    },
  },
});
