import { defineBuildConfig } from '../../src'

export default defineBuildConfig({
  preset: './build.preset',
  rollup: {
    emitCJS: true
  },
  entries: [
    'src/index',
    { input: 'src/runtime/', outDir: 'dist/runtime' },
    { input: 'src/schema', builder: 'untyped' }
  ]
})
