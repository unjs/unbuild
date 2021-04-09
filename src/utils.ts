import fsp from 'fs/promises'

export async function symlink (from: string, to: string, force: boolean = true) {
  if (force) {
    await fsp.unlink(to).catch(() => { })
  }
  await fsp.symlink(from, to)
}

export function dumpObject (obj: Record<string, any>) {
  return '{ ' + Object.keys(obj).map(key => `${key}: ${JSON.stringify(obj[key])}`).join(', ') + ' }'
}
