#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import consola from "consola";
import { resolve } from "pathe";
import { name, version, description } from "../package.json";
import { build } from "./build";

const main = defineCommand({
  meta: {
    name,
    version,
    description,
  },
  args: {
    dir: {
      type: "positional",
      description: "The directory to build",
      required: false,
    },
    watch: {
      type: "boolean",
      description: "Watch the src dir and rebuild on change (experimental)",
    },
    stub: {
      type: "boolean",
      description: "Stub the package for JIT compilation",
    },
    minify: {
      type: "boolean",
      description: "Minify build",
    },
    sourcemap: {
      type: "boolean",
      description: "Generate sourcemaps (experimental)",
    },
  },
  async run({ args }) {
    const rootDir = resolve(process.cwd(), args.dir || ".");
    await build(rootDir, args.stub, {
      sourcemap: args.sourcemap,
      stub: args.stub,
      watch: args.watch,
      rollup: {
        esbuild: {
          minify: args.minify,
        },
      },
    }).catch((error) => {
      consola.error(`Error building ${rootDir}: ${error}`);
      throw error;
    });
  },
});

runMain(main);
