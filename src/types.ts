import type { PackageJson } from 'pkg-types'
import type { Hookable } from 'hookable'
import type { RollupOptions, RollupBuild } from 'rollup'
import type { MkdistOptions } from 'mkdist'
import { Schema } from 'untyped'

export interface BuildEntry {
  input: string
  name?: string
  builder?: 'rollup' | 'mkdist' | 'untyped'
  format?: 'esm' | 'cjs'
  defaults?: Record<string, any>
  declaration?: boolean
  outDir?: string
  ext?: 'cjs' | 'mjs' | 'js' | 'ts'
}

export type MkdistEntry = BuildEntry & { builder: 'mkdist' }
export type UntypedEntry = BuildEntry & { builder: 'untyped' }

export interface BuildOptions {
  rootDir: string
  declaration?: boolean
  entries: BuildEntry[],
  clean: boolean
  outDir: string
  stub: boolean
  dependencies: string[],
  devDependencies: string[]
  externals: string[]
  inlineDependencies: boolean
  emitCJS: boolean
  cjsBridge: boolean
}

export interface BuildContext {
  options: BuildOptions,
  pkg: PackageJson,
  buildEntries: { path: string, bytes?: number, exports?: string[], chunks?: string[] }[]
  usedImports: Set<string>
  hooks: Hookable<BuildHooks> // eslint-disable-line no-use-before-define
}

export interface BuildConfig extends Partial<Omit<BuildOptions, 'entries'>> {
  entries: (BuildEntry | string)[],
  hooks?: BuildHooks // eslint-disable-line no-use-before-define
}

export interface UntypedOutput { fileName: string, contents: string }
export interface UntypedOutputs {
  markdown: UntypedOutput,
  schema: UntypedOutput,
  defaults: UntypedOutput,
   declaration?: UntypedOutput
  }

export interface BuildHooks {
  'build:before': (ctx: BuildContext) => void | Promise<void>
  'build:done': (ctx: BuildContext) => void | Promise<void>

  'rollup:options': (ctx: BuildContext, options: RollupOptions) => void | Promise<void>
  'rollup:build': (ctx: BuildContext, build: RollupBuild) => void | Promise<void>
  'rollup:dts:options': (ctx: BuildContext, options: RollupOptions) => void | Promise<void>
  'rollup:dts:build': (ctx: BuildContext, build: RollupBuild) => void | Promise<void>
  'rollup:done': (ctx: BuildContext) => void | Promise<void>

  'mkdist:entries': (ctx: BuildContext, entries: MkdistEntry[]) => void | Promise<void>
  'mkdist:entry:options': (ctx: BuildContext, entry: MkdistEntry, options: MkdistOptions) => void | Promise<void>
  'mkdist:entry:build': (ctx: BuildContext, entry: MkdistEntry, output: { writtenFiles: string[] }) => void | Promise<void>
  'mkdist:done': (ctx: BuildContext) => void | Promise<void>

  'untyped:entries': (ctx: BuildContext, entries: UntypedEntry[]) => void | Promise<void>
  'untyped:entry:options': (ctx: BuildContext, entry: UntypedEntry, options: any) => void | Promise<void>
  'untyped:entry:schema': (ctx: BuildContext, entry: UntypedEntry, schema: Schema) => void | Promise<void>
  'untyped:entry:outputs': (ctx: BuildContext, entry: UntypedEntry, outputs: UntypedOutputs) => void | Promise<void>
  'untyped:done': (ctx: BuildContext) => void | Promise<void>
}

export function defineBuildConfig (config: BuildConfig): BuildConfig {
  return config
}
