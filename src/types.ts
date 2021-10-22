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
  pkg: any,
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

export interface BuildContext extends BuildOptions {
  buildEntries: { path: string, bytes?: number, exports?: string[], chunks?: string[] }[]
  usedImports: Set<string>
}

export interface BuildConfig extends Partial<Omit<BuildOptions, 'entries'>> {
  entries: (BuildEntry | string)[],
}

export function defineBuildConfig (config: BuildConfig): BuildConfig {
  return config
}
