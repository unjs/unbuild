export interface BuildEntry {
  input: string
  name?: string
  builder?: 'rollup' | 'mkdist' | 'untyped'
  format?: 'esm' | 'cjs'
  defaults?: Record<string, any>
}

export interface BuildOptions {
  pkg: any,
  rootDir: string
  entries: BuildEntry[],
  clean: boolean
  outDir: string
  genDir: string
  stub: boolean
  dependencies: string[],
  externals: string[]
}

export interface BuildContext extends BuildOptions {
  buildEntries: { path: string, bytes?: number, exports?: string[], chunks?: string[] }[]
  usedImports: Set<string>
}

export interface BuildConfig extends Partial<Omit<BuildOptions, 'entries'>> {
  entries: (BuildEntry | string)[],
}
