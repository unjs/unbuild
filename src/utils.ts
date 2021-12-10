import fsp from 'fs/promises'
import { promisify } from 'util'
import { readdirSync, statSync } from 'fs'
import { dirname, resolve } from 'pathe'
import mkdirp from 'mkdirp'
import _rimraf from 'rimraf'
import jiti from 'jiti'
import { autoPreset } from './auto'
import type { BuildPreset, BuildConfig } from './types'

export async function ensuredir (path: string) {
  await mkdirp(dirname(path))
}

export async function symlink (from: string, to: string, force: boolean = true) {
  await ensuredir(to)
  if (force) {
    await fsp.unlink(to).catch(() => { })
  }
  await fsp.symlink(from, to, 'junction')
}

export function dumpObject (obj: Record<string, any>) {
  return '{ ' + Object.keys(obj).map(key => `${key}: ${JSON.stringify(obj[key])}`).join(', ') + ' }'
}

export function getpkg (id: string = '') {
  const s = id.split('/')
  return s[0][0] === '@' ? `${s[0]}/${s[1]}` : s[0]
}

const rimraf = promisify(_rimraf)

export async function rmdir (dir: string) {
  await fsp.unlink(dir).catch(() => { })
  await rimraf(dir)
}

export function listRecursively (path: string) {
  const filenames = new Set<string>()
  const walk = (path: string) => {
    const files = readdirSync(path)
    for (const file of files) {
      const fullPath = resolve(path, file)
      if (statSync(fullPath).isDirectory()) {
        filenames.add(fullPath + '/')
        walk(fullPath)
      } else {
        filenames.add(fullPath)
      }
    }
  }
  walk(path)
  return Array.from(filenames)
}

export function tryRequire (id: string, rootDir: string = process.cwd()) {
  const _require = jiti(rootDir, { interopDefault: true })
  try {
    return _require(id)
  } catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(`Error trying import ${id} from ${rootDir}`, err)
    }
    return {}
  }
}

export function tryResolve (id: string, rootDir: string = process.cwd()) {
  const _require = jiti(rootDir, { interopDefault: true })
  try {
    return _require.resolve(id)
  } catch (err: any) {
    if (err.code !== 'MODULE_NOT_FOUND') {
      console.error(`Error trying import ${id} from ${rootDir}`, err)
    }
    return id
  }
}

export function resolvePreset (preset: string | BuildPreset, rootDir: string): BuildConfig {
  if (preset === 'auto') {
    preset = autoPreset
  } else if (typeof preset === 'string') {
    preset = tryRequire(preset, rootDir) || {}
  }
  if (typeof preset === 'function') {
    preset = preset()
  }
  return preset as BuildConfig
}
