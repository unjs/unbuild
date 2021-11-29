import type { BuildConfig } from 'unbuild'

export default <BuildConfig>{
  cjsBridge: true,
  declaration: true,
  hooks: {
    'build:before': () => { console.log('Before build') },
    'build:done': () => { console.log('After build') }
  }
}
