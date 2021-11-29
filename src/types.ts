import type { PackageJson } from 'pkg-types'
import type { Hooks, Hookable } from 'hookable'

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
  hooks: BuildHooks // eslint-disable-line no-use-before-define
}

export interface BuildHooks extends Hooks {
  'build:before': (ctx: BuildContext) => void | Promise<void>
  'build:after': (ctx: BuildContext) => void | Promise<void>
}

export function defineBuildConfig (config: BuildConfig): BuildConfig {
  return config
}
