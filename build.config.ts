import { defineBuildConfig } from './src'

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: false
  },
  entries: [
    'src/index',
    'src/cli'
  ],
  dependencies: [
    'esbuild',
    'typescript'
  ]
})
