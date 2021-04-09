import chalk from 'chalk'
import consola from 'consola'
import { BuildContext } from './types'
import { getpkg } from './utils'

export function validateDependencies (ctx: BuildContext) {
  const usedDependencies = new Set<string>()
  const unusedDependencies = new Set<string>(Object.keys(ctx.pkg.dependencies || {}))
  const implicitDependnecies = new Set<string>()
  for (const id of ctx.usedImports) {
    unusedDependencies.delete(id)
    usedDependencies.add(id)
  }
  if (Array.isArray(ctx.dependencies)) {
    for (const id of ctx.dependencies) {
      unusedDependencies.delete(id)
    }
  }
  for (const id of usedDependencies) {
    if (
      !ctx.externals.includes(id) &&
      !id.startsWith('chunks/') &&
      !ctx.dependencies.includes(getpkg(id))
    ) {
      implicitDependnecies.add(id)
    }
  }
  if (unusedDependencies.size) {
    consola.warn('Potential unused dependencies found:', Array.from(unusedDependencies).map(id => chalk.cyan(id)).join(', '))
  }
  if (implicitDependnecies.size && !ctx.inlineDependencies) {
    consola.warn('Potential implicit dependencies found:', Array.from(implicitDependnecies).map(id => chalk.cyan(id)).join(', '))
  }
}

