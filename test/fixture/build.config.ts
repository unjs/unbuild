import type { BuildConfig } from 'unbuild'

export default <BuildConfig>{
  cjsBridge: true,
  declaration: true,
  entries: [
    'src/index',
    { input: 'src/schema', builder: 'untyped' }
  ],
  hooks: {
    'build:before': () => { console.log('Before build') },
    'build:after': () => { console.log('After build') }
  }
}
