import Module from 'module'
import { resolve, basename } from 'upath'
import chalk from 'chalk'
import consola from 'consola'
import defu from 'defu'
import prettyBytes from 'pretty-bytes'
import jiti from 'jiti'
import { dumpObject, cleanDir } from './utils'
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
    devDependencies: [],
    externals: [...Module.builtinModules],
    srcDir: 'src',
    outDir: 'dist',
    genDir: '.gen',
    untyped: undefined,
    declaration: undefined,
    inlineDependencies: false,
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

    if (ctx.declaration !== undefined && entry.declaration === undefined) {
      entry.declaration = ctx.declaration
    }

    entry.input = resolve(ctx.rootDir, entry.input)
    entry.outDir = resolve(ctx.rootDir, entry.outDir || ctx.outDir)
  }

  // Collect dependencies and devDependnecies
  ctx.dependencies = Object.keys(pkg.dependencies || {})
  ctx.devDependencies = Object.keys(pkg.devDependencies || {})

  // Add dependencies from package.json as externals
  ctx.externals.push(...ctx.dependencies)

  // Start info
  consola.info(chalk.cyan(`${ctx.stub ? 'Stubbing' : 'Building'} ${pkg.name}`))
  if (process.env.DEBUG) {
    consola.info(`${chalk.bold('Root dir:')} ${ctx.rootDir}
  ${chalk.bold('Entries:')}
  ${ctx.entries.map(entry => '  ' + dumpObject(entry)).join('\n  ')}
`)
  }

  // Clean dist dirs
  if (ctx.clean) {
    for (const dir of new Set(ctx.entries.map(e => e.outDir).sort())) {
      await cleanDir(dir!)
    }
  }

  // Try to selflink
  // if (ctx.stub && ctx.pkg.name) {
  //   const nodemodulesDir = resolve(ctx.rootDir, 'node_modules', ctx.pkg.name)
  //   await symlink(resolve(ctx.rootDir), nodemodulesDir).catch(() => {})
  // }

  // untyped
  await typesBuild(ctx)

  // mkdist
  await mkdistBuild(ctx)

  // rollup
  await rollupBuild(ctx)

  // Skip rest for stub
  if (ctx.stub) {
    return
  }

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
