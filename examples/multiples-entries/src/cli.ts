export default function cli(args: string[]) {
  const name = args[0] || 'world'
  console.log(`Hello ${name}!`)
}
