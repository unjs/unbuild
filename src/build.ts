import { promisify } from 'util'
import Module from 'module'
import { mkdir, unlink } from 'fs/promises'
import { resolve, basename } from 'upath'
import chalk from 'chalk'
import consola from 'consola'
import rimraf from 'rimraf'
import defu from 'defu'
import prettyBytes from 'pretty-bytes'
import jiti from 'jiti'
import type { BuildContext } from './types'
import { validateDependencies } from './validate'
import { rollupBuild } from './builder/rollup'
import { typesBuild } from './builder/untyped'
import { mkdistBuild } from './builder/mkdist'

export async function build (rootDir: string, stub: boolean) {
  rootDir = resolve(process.cwd(), rootDir || '.')

  // Read build.config and package.json
  const _require = jiti(rootDir)
  let buildConfigFile
  try { buildConfigFile = _require.resolve('./build.config') } catch (e) {}
  const buildConfig = buildConfigFile ? _require('./build.config').default : {}
  const pkg = _require('./package.json')

  // Build context
  const ctx: BuildContext = defu(buildConfig, {
    pkg,
    rootDir,
    entries: [],
    dependencies: [],
    externals: [...Module.builtinModules],
    srcDir: 'src',
    outDir: 'dist',
    genDir: '.gen',
    untyped: undefined,
    clean: true,
    stub,
    buildEntries: [],
    usedImports: new Set()
  } as BuildContext) as BuildContext

  // Normalize entries
  ctx.entries = ctx.entries.map(entry =>
    typeof entry === 'string' ? { input: entry } : entry
  )
  for (const entry of ctx.entries) {
    if (typeof entry.name !== 'string') {
      entry.name = basename(entry.input)
    }
    if (!entry.input) {
      throw new Error('Missing entry input: ' + dumpObject(entry))
    }
    if (!entry.builder) {
      entry.builder = entry.input.endsWith('/') ? 'mkdist' : 'rollup'
    }
  }

  // Add dependencies from package.json as externals
  if (pkg.dependencies) {
    ctx.externals.push(...Object.keys(pkg.dependencies))
  }

  // Start info
  consola.info(chalk.cyan(`Building ${pkg.name}`))
  if (process.env.DEBUG) {
    consola.info(`${chalk.bold('Root dir:')} ${ctx.rootDir}
  ${chalk.bold('Entries:')}
  ${ctx.entries.map(entry => '  ' + dumpObject(entry)).join('\n  ')}
`)
  }

  // Clean dist dir
  if (ctx.clean) {
    const outDir = resolve(ctx.rootDir, ctx.outDir)
    await unlink(outDir).catch(() => { })
    await promisify(rimraf)(outDir)
    await mkdir(outDir).catch(() => { })
  }

  // untyped
  await typesBuild(ctx)

  // mkdist
  await mkdistBuild(ctx)

  // rollup
  await rollupBuild(ctx)

  // Done info
  consola.success(chalk.green('Build succeed for ' + pkg.name))
  for (const entry of ctx.buildEntries) {
    consola.log(`  ${chalk.bold(entry.path)} (` + [
      entry.bytes && `size: ${chalk.cyan(prettyBytes(entry.bytes))}`,
      entry.exports && `exports: ${chalk.gray(entry.exports.join(', '))}`,
      entry.chunks && `chunks: ${chalk.gray(entry.chunks.join(', '))}`
    ].filter(Boolean).join(', ') + ')')
  }

  // Validate
  validateDependencies(ctx)

  consola.log('')
}

function dumpObject (obj: Record<string, any>) {
  return '{ ' + Object.keys(obj).map(key => `${key}: ${JSON.stringify(obj[key])}`).join(', ') + ' }'
}
