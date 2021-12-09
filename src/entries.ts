import { normalize, join } from 'pathe'

import type { PackageJson } from 'pkg-types'
import { listRecursively } from './utils'
import type { BuildEntry, MkdistBuildEntry } from '.'

type OutputDescriptor = { type: 'esm' | 'cjs', file: string }

type InferEntriesResult = { emitCJS?: boolean, entries: BuildEntry[], declaration?: boolean }

/**
 * @param {PackageJson} pkg The contents of a package.json file to serve as the source for inferred entries.
 * @param {string | string[]} source The root directory of the project.
 *   - if string, `<source>/src` will be scanned for possible source files.
 *   - if an array of source files, these will be used directly instead of accessing fs.
 */
export function inferEntries (pkg: PackageJson, source: string | string[] = process.cwd()): InferEntriesResult {
  const sourceFiles = Array.isArray(source) ? source : listRecursively(join(source, 'src'))

  // Come up with a list of all output files & their formats
  const outputs: OutputDescriptor[] = extractExportFilenames(pkg.exports)

  if (pkg.bin) {
    const binaries = typeof pkg.bin === 'string' ? [pkg.bin] : Object.values(pkg.bin)
    for (const file of binaries) {
      outputs.push({ type: file.endsWith('.mjs') || pkg.type === 'module' ? 'esm' : 'cjs', file })
    }
  }
  if (pkg.main) {
    outputs.push({ type: pkg.main.endsWith('.mjs') || pkg.type === 'module' ? 'esm' : 'cjs', file: pkg.main })
  }
  if (pkg.module) {
    outputs.push({ type: 'esm', file: pkg.module })
  }
  if (pkg.types || pkg.typings) {
    outputs.push({ type: 'esm', file: pkg.types || pkg.typings! })
  }

  let emitCJS
  let declaration

  const entries: BuildEntry[] = []
  for (const output of outputs) {
    // Supported output file extensions are `.d.ts`, `.cjs` and `.mjs`
    // but we support any file extension here in case user has extended rollup options
    const outputSlug = output.file.replace(/(\*[^\\/]*|\.d\.ts|\.\w+)$/, '')
    const isDir = outputSlug.endsWith('/')

    // Skip top level directory
    if (isDir && ['./', '/'].includes(outputSlug)) { continue }

    const possiblePaths = getEntrypointPaths(outputSlug)
    const input = possiblePaths.reduce<string | undefined>((source, d) => {
      if (source) { return source }
      const SOURCE_RE = new RegExp(`${d}${isDir ? '' : '\\.\\w+'}$`)
      return sourceFiles.find(i => i.match(SOURCE_RE))?.replace(/(\.d\.ts|\.\w+)$/, '')
    }, undefined)

    if (!input) {
      console.log(`could not infer entrypoint for \`${output.file}\``)
      continue
    }

    if (output.type === 'cjs') {
      emitCJS = true
    }

    const entry = entries.find(i => i.input === input) || entries[entries.push({ input }) - 1]

    if (output.file.endsWith('.d.ts')) {
      declaration = true
    }

    if (isDir) {
      entry.outDir = outputSlug
      ;(entry as MkdistBuildEntry).format = output.type
    }
  }

  return {
    emitCJS,
    declaration,
    entries
  }
}

export function inferExportType (condition: string, previousConditions: string[] = [], filename = ''): 'esm' | 'cjs' {
  if (filename) {
    if (filename.endsWith('.d.ts')) {
      return 'esm'
    }
    if (filename.endsWith('.mjs')) {
      return 'esm'
    }
    if (filename.endsWith('.cjs')) {
      return 'cjs'
    }
  }
  switch (condition) {
    case 'import':
      return 'esm'
    case 'require':
      return 'cjs'
    default: {
      if (!previousConditions.length) {
        return 'esm'
      }
      const [newCondition, ...rest] = previousConditions
      return inferExportType(newCondition, rest, filename)
    }
  }
}

export function extractExportFilenames (exports: PackageJson['exports'], conditions: string[] = []): OutputDescriptor[] {
  if (!exports) { return [] }
  if (typeof exports === 'string') {
    return [{ file: exports, type: 'esm' }]
  }
  return Object.entries(exports).flatMap(
    ([condition, exports]) => typeof exports === 'string'
      ? { file: exports, type: inferExportType(condition, conditions, exports) }
      : extractExportFilenames(exports, [...conditions, condition])
  )
}

export const getEntrypointPaths = (path: string) => {
  const segments = normalize(path).split('/')
  return segments.map((_, index) => segments.slice(index).join('/')).filter(Boolean)
}

export const getEntrypointFilenames = (path: string, supportedExtensions = ['.ts', '.mjs', '.cjs', '.js', '.json']) => {
  if (path.startsWith('./')) { path = path.slice(2) }

  const filenames = getEntrypointPaths(path).flatMap((path) => {
    const basefile = path.replace(/\.\w+$/, '')
    return [
      basefile,
      `${basefile}/index`
    ]
  })

  filenames.push('index')

  return filenames.flatMap(name => supportedExtensions.map(ext => `${name}${ext}`))
}
