import { normalize, join } from 'pathe'
import consola from 'consola'
import chalk from 'chalk'
import type { PackageJson } from 'pkg-types'
import { listRecursively } from './utils'
import { BuildEntry, definePreset, MkdistBuildEntry } from './types'

type OutputDescriptor = { file: string, type?: 'esm' | 'cjs' }
type InferEntriesResult = { entries: BuildEntry[], cjs?: boolean, dts?: boolean }

export const autoPreset = definePreset(() => {
  return {
    hooks: {
      'build:prepare' (ctx) {
        // Disable auto if entries already provided of pkg not available
        if (!ctx.pkg || ctx.options.entries.length) {
          return
        }
        const sourceFiles = listRecursively(join(ctx.options.rootDir, 'src'))
        const res = inferEntries(ctx.pkg, sourceFiles)
        ctx.options.entries.push(...res.entries)
        if (res.cjs) {
          ctx.options.rollup.emitCJS = true
        }
        if (res.dts) {
          ctx.options.declaration = res.dts
        }
        consola.info(
          'Automatically detected entries:',
          chalk.cyan(ctx.options.entries.map(e => chalk.bold(e.input.replace(ctx.options.rootDir + '/', '').replace(/\/$/, '/*'))).join(', ')),
          chalk.gray(['esm', res.cjs && 'cjs', res.dts && 'dts'].filter(Boolean).map(tag => `[${tag}]`).join(' '))
        )
      }
    }
  }
})

/**
 * @param {PackageJson} pkg The contents of a package.json file to serve as the source for inferred entries.
 * @param {string | string[]} source The root directory of the project.
 *   - if string, `<source>/src` will be scanned for possible source files.
 *   - if an array of source files, these will be used directly instead of accessing fs.
 */
export function inferEntries (pkg: PackageJson, sourceFiles: string[]): InferEntriesResult {
  // Come up with a list of all output files & their formats
  const outputs: OutputDescriptor[] = extractExportFilenames(pkg.exports)

  if (pkg.bin) {
    const binaries = typeof pkg.bin === 'string' ? [pkg.bin] : Object.values(pkg.bin)
    for (const file of binaries) {
      outputs.push({ file })
    }
  }
  if (pkg.main) {
    outputs.push({ file: pkg.main })
  }
  if (pkg.module) {
    outputs.push({ type: 'esm', file: pkg.module })
  }
  if (pkg.types || pkg.typings) {
    outputs.push({ file: pkg.types || pkg.typings! })
  }

  // Try to detect output types
  const isESMPkg = pkg.type === 'module'
  for (const output of outputs.filter(o => !o.type)) {
    const isJS = output.file.endsWith('.js')
    if ((isESMPkg && isJS) || output.file.endsWith('.mjs')) {
      output.type = 'esm'
    } else if ((!isESMPkg && isJS) || output.file.endsWith('.cjs')) {
      output.type = 'cjs'
    }
  }

  let cjs = false
  let dts = false

  // Infer entries from package files
  const entries: BuildEntry[] = []
  for (const output of outputs) {
    // Supported output file extensions are `.d.ts`, `.cjs` and `.mjs`
    // But we support any file extension here in case user has extended rollup options
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
      consola.warn(`could not infer entrypoint for \`${output.file}\``)
      continue
    }

    if (output.type === 'cjs') {
      cjs = true
    }

    const entry = entries.find(i => i.input === input) || entries[entries.push({ input }) - 1]

    if (output.file.endsWith('.d.ts')) {
      dts = true
    }

    if (isDir) {
      entry.outDir = outputSlug
      ;(entry as MkdistBuildEntry).format = output.type
    }
  }

  return { entries, cjs, dts }
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
        // TODO: Check against type:module for default
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
