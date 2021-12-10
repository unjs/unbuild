/* eslint-disable no-use-before-define */
import type { PackageJson } from 'pkg-types'
import type { Hookable } from 'hookable'
import type { RollupOptions, RollupBuild } from 'rollup'
import type { MkdistOptions } from 'mkdist'
import type { Options as EsbuildOptions } from 'rollup-plugin-esbuild'
import { Schema } from 'untyped'

export interface BaseBuildEntry {
  builder?: 'untyped' | 'rollup' | 'mkdist'
  input: string
  name?: string
  outDir?: string
  declaration?: boolean
}

export interface UntypedBuildEntry extends BaseBuildEntry {
  builder: 'untyped'
  defaults?: Record<string, any>
}

export interface RollupBuildEntry extends BaseBuildEntry {
  builder: 'rollup'
}

export interface MkdistBuildEntry extends BaseBuildEntry {
  builder: 'mkdist'
  format?: 'esm' | 'cjs'
  ext?: 'cjs' | 'mjs' | 'js' | 'ts'
}

export type BuildEntry = BaseBuildEntry | RollupBuildEntry | UntypedBuildEntry | MkdistBuildEntry

export interface RollupBuildOptions {
  emitCJS?: boolean
  cjsBridge?: boolean
  inlineDependencies?: boolean
  esbuild: EsbuildOptions
}

export interface BuildOptions {
  rootDir: string
  entries: BuildEntry[],
  clean: boolean
  declaration?: boolean
  outDir: string
  stub: boolean
  externals: string[]
  dependencies: string[]
  peerDependencies: string[]
  devDependencies: string[]
  alias: { [find: string]: string },
  rollup: RollupBuildOptions
}

export interface BuildContext {
  options: BuildOptions,
  pkg: PackageJson,
  buildEntries: { path: string, bytes?: number, exports?: string[], chunks?: string[] }[]
  usedImports: Set<string>
  hooks: Hookable<BuildHooks>
}

export type BuildPreset = BuildConfig | (() => BuildConfig)

export interface BuildConfig extends Partial<Omit<BuildOptions, 'entries'>> {
  entries?: (BuildEntry | string)[]
  preset?: string | BuildPreset
  hooks?: Partial<BuildHooks>
}

export interface UntypedOutput { fileName: string, contents: string }
export interface UntypedOutputs {
  markdown: UntypedOutput,
  schema: UntypedOutput,
  defaults: UntypedOutput,
   declaration?: UntypedOutput
  }

export interface BuildHooks {
  'build:prepare': (ctx: BuildContext) => void | Promise<void>
  'build:before': (ctx: BuildContext) => void | Promise<void>
  'build:done': (ctx: BuildContext) => void | Promise<void>

  'rollup:options': (ctx: BuildContext, options: RollupOptions) => void | Promise<void>
  'rollup:build': (ctx: BuildContext, build: RollupBuild) => void | Promise<void>
  'rollup:dts:options': (ctx: BuildContext, options: RollupOptions) => void | Promise<void>
  'rollup:dts:build': (ctx: BuildContext, build: RollupBuild) => void | Promise<void>
  'rollup:done': (ctx: BuildContext) => void | Promise<void>

  'mkdist:entries': (ctx: BuildContext, entries: MkdistBuildEntry[]) => void | Promise<void>
  'mkdist:entry:options': (ctx: BuildContext, entry: MkdistBuildEntry, options: MkdistOptions) => void | Promise<void>
  'mkdist:entry:build': (ctx: BuildContext, entry: MkdistBuildEntry, output: { writtenFiles: string[] }) => void | Promise<void>
  'mkdist:done': (ctx: BuildContext) => void | Promise<void>

  'untyped:entries': (ctx: BuildContext, entries: UntypedBuildEntry[]) => void | Promise<void>
  'untyped:entry:options': (ctx: BuildContext, entry: UntypedBuildEntry, options: any) => void | Promise<void>
  'untyped:entry:schema': (ctx: BuildContext, entry: UntypedBuildEntry, schema: Schema) => void | Promise<void>
  'untyped:entry:outputs': (ctx: BuildContext, entry: UntypedBuildEntry, outputs: UntypedOutputs) => void | Promise<void>
  'untyped:done': (ctx: BuildContext) => void | Promise<void>
}

export function defineBuildConfig (config: BuildConfig): BuildConfig {
  return config
}

export function definePreset (preset: BuildPreset): BuildPreset {
  return preset
}
