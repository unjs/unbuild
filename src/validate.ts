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
  if (Array.isArray(ctx.options.dependencies)) {
    for (const id of ctx.options.dependencies) {
      unusedDependencies.delete(id)
    }
  }
  for (const id of usedDependencies) {
    if (
      !ctx.options.externals.includes(id) &&
      !id.startsWith('chunks/') &&
      !ctx.options.dependencies.includes(getpkg(id))
    ) {
      implicitDependnecies.add(id)
    }
  }
  if (unusedDependencies.size) {
    consola.warn('Potential unused dependencies found:', Array.from(unusedDependencies).map(id => chalk.cyan(id)).join(', '))
  }
  if (implicitDependnecies.size && !ctx.options.inlineDependencies) {
    consola.warn('Potential implicit dependencies found:', Array.from(implicitDependnecies).map(id => chalk.cyan(id)).join(', '))
  }
}
