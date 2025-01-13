import { defineBuildConfig } from "../../../src";

export default defineBuildConfig({
  entries: ["./index.ts", "./types.ts"],
  declaration: true,
  clean: true,
  // avoid exit code 1 on warnings
  failOnWarn: false,
  rollup: {
    emitCJS: true,
  },
});
