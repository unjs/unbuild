import { definePreset } from "../../src";

export default definePreset({
  declaration: "compatible",
  rollup: {
    cjsBridge: true,
  },
  hooks: {
    "build:before": () => {
      console.log("Before build");
    },
    "build:done": () => {
      console.log("After build");
    },
  },
});
