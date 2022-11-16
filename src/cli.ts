#!/usr/bin/env node
import { resolve } from "pathe";
import mri from "mri";
import { build } from "./build";

async function main () {
  const args = mri(process.argv.splice(2));
  const rootDir = resolve(process.cwd(), args._[0] || ".");
  await build(rootDir, args.stub).catch((error) => {
    console.error(`Error building ${rootDir}: ${error}`);
    throw error;
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
