import fsp from 'fs/promises'
import { promisify } from 'util'
import { dirname } from 'pathe'
import mkdirp from 'mkdirp'
import _rimraf from 'rimraf'
import jiti from 'jiti'

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
