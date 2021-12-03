#!/bin/env node
import { resolve } from 'pathe'
import mri from 'mri'
import { build } from './build'

async function main () {
  const args = mri(process.argv.splice(2))
  const rootDir = resolve(process.cwd(), args._[0] || '.')
  await build(rootDir, args.stub).catch((err) => {
    console.error(`Error building ${rootDir}: ${err}`)
    throw err
  })
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
