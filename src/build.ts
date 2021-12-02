import Module from 'module'
import { resolve, basename } from 'pathe'
import chalk from 'chalk'
import consola from 'consola'
import defu from 'defu'
import { createHooks } from 'hookable'
import prettyBytes from 'pretty-bytes'
import jiti from 'jiti'
import mkdirp from 'mkdirp'
import { dumpObject, rmdir } from './utils'
import type { BuildContext, BuildConfig, BuildOptions } from './types'
import { validateDependencies } from './validate'
import { rollupBuild } from './builder/rollup'
import { typesBuild } from './builder/untyped'
import { mkdistBuild } from './builder/mkdist'

export async function build (rootDir: string, stub: boolean) {
  // Determine rootDir
  rootDir = resolve(process.cwd(), rootDir || '.')

  // Read build.config and package.json
  const _require = jiti(rootDir, { interopDefault: true })
  let buildConfigFile
  try { buildConfigFile = _require.resolve('./build.config') } catch (e) {}
  const buildConfig: BuildConfig = buildConfigFile ? _require('./build.config') : {}
  const pkg = _require('./package.json')

  // Resolve preset
  let preset = buildConfig.preset || pkg.unbuild?.preset || pkg.build?.preset || {}
  if (typeof preset === 'string') {
    preset = _require(preset)
  }

  // Merge options
  const options = defu(buildConfig, pkg.unbuild || pkg.build, preset, <BuildOptions>{
    rootDir,
    entries: [],
    clean: true,
    declaration: false,
    outDir: 'dist',
    stub,
    externals: [...Module.builtinModules],
    dependencies: [],
    devDependencies: [],
    peerDependencies: [],
    rollup: {
      emitCJS: true,
      cjsBridge: false,
      inlineDependencies: false
    }
  }) as BuildOptions

  // Build context
  const ctx: BuildContext = {
    options,
    pkg,
    buildEntries: [],
    usedImports: new Set(),
    hooks: createHooks()
  }

  // Register hooks
  if (buildConfig.hooks) {
    ctx.hooks.addHooks(buildConfig.hooks)
  }
  if (preset.hooks) {
    ctx.hooks.addHooks(preset.hooks)
  }

  // Normalize entries
  options.entries = options.entries.map(entry =>
    typeof entry === 'string' ? { input: entry } : entry
  )

  for (const entry of options.entries) {
    if (typeof entry.name !== 'string') {
      entry.name = basename(entry.input)
    }

    if (!entry.input) {
      throw new Error('Missing entry input: ' + dumpObject(entry))
    }

    if (!entry.builder) {
      entry.builder = entry.input.endsWith('/') ? 'mkdist' : 'rollup'
    }

    if (options.declaration !== undefined && entry.declaration === undefined) {
      entry.declaration = options.declaration
    }

    entry.input = resolve(options.rootDir, entry.input)
    entry.outDir = resolve(options.rootDir, entry.outDir || options.outDir)
  }

  // Infer dependencies from pkg
  options.dependencies = Object.keys(pkg.dependencies || {})
  options.peerDependencies = Object.keys(pkg.dependencies || {})
  options.devDependencies = Object.keys(pkg.devDependencies || {})

  // Add all dependencies as externals
  options.externals.push(...options.dependencies, ...options.peerDependencies)

  // Call build:before
  await ctx.hooks.callHook('build:before', ctx)

  // Start info
  consola.info(chalk.cyan(`${options.stub ? 'Stubbing' : 'Building'} ${pkg.name}`))
  if (process.env.DEBUG) {
    consola.info(`${chalk.bold('Root dir:')} ${options.rootDir}
  ${chalk.bold('Entries:')}
  ${options.entries.map(entry => '  ' + dumpObject(entry)).join('\n  ')}
`)
  }

  // Clean dist dirs
  if (options.clean) {
    for (const dir of new Set(options.entries.map(e => e.outDir).sort())) {
      await rmdir(dir!)
      await mkdirp(dir!)
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
  if (options.stub) {
    await ctx.hooks.callHook('build:done', ctx)
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

  // Call build:done
  await ctx.hooks.callHook('build:done', ctx)

  consola.log('')
}
