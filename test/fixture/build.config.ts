import { defineBuildConfig } from '../../src'

export default defineBuildConfig({
  preset: './build.preset',
  rollup: {
    emitCJS: true
  },
  entries: [
    'src/index',
    { input: 'src/schema', builder: 'untyped' }
  ]
})
