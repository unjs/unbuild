import Module from 'module'
import { resolve, basename } from 'pathe'
import type { PackageJson } from 'pkg-types'
import chalk from 'chalk'
import consola from 'consola'
import defu from 'defu'
import { createHooks } from 'hookable'
import prettyBytes from 'pretty-bytes'
import mkdirp from 'mkdirp'
import { dumpObject, rmdir, tryRequire, resolvePreset } from './utils'
import type { BuildContext, BuildConfig, BuildOptions } from './types'
import { validatePackage, validateDependencies } from './validate'
import { rollupBuild } from './builder/rollup'
import { typesBuild } from './builder/untyped'
import { mkdistBuild } from './builder/mkdist'

export async function build (rootDir: string, stub: boolean, inputConfig: BuildConfig = {}) {
  // Determine rootDir
  rootDir = resolve(process.cwd(), rootDir || '.')

  // Read build.config and package.json
  const buildConfig: BuildConfig = tryRequire('./build.config', rootDir) || {}
  const pkg: PackageJson & Record<'unbuild' | 'build', BuildConfig> = tryRequire('./package.json', rootDir)

  // Resolve preset
  const preset = resolvePreset(buildConfig.preset || pkg.unbuild?.preset || pkg.build?.preset || inputConfig.preset || 'auto', rootDir)

  // Merge options
  const options = defu(buildConfig, pkg.unbuild || pkg.build, inputConfig, preset, <BuildOptions>{
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
    alias: {},
    rollup: {
      esbuild: {
        target: 'es2020'
      },
      emitCJS: false,
      cjsBridge: false,
      inlineDependencies: false
    }
  }) as BuildOptions

  // Resolve dirs relative to rootDir
  options.outDir = resolve(options.rootDir, options.outDir)

  // Build context
  const ctx: BuildContext = {
    options,
    pkg,
    buildEntries: [],
    usedImports: new Set(),
    hooks: createHooks()
  }

  // Register hooks
  if (preset.hooks) {
    ctx.hooks.addHooks(preset.hooks)
  }
  if (inputConfig.hooks) {
    ctx.hooks.addHooks(inputConfig.hooks)
  }
  if (buildConfig.hooks) {
    ctx.hooks.addHooks(buildConfig.hooks)
  }

  // Allow prepare and extending context
  await ctx.hooks.callHook('build:prepare', ctx)

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
  options.peerDependencies = Object.keys(pkg.peerDependencies || {})
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
  validatePackage(pkg, rootDir)

  // Call build:done
  await ctx.hooks.callHook('build:done', ctx)

  consola.log('')
}
