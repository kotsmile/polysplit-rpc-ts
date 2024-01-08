import { unused$ } from './misc'

type RunFunc = (
  name: string,
  func: (...args: string[]) => Promise<void> | void
) => void

type Run = {
  disabled: RunFunc
} & RunFunc

export const run: Run = (async (
  name: string,
  func: (...args: string[]) => Promise<void> | void
) => {
  console.log(`[${name}] executing`)
  try {
    await func(...process.argv.slice(2))
    console.log(`[${name}] executed successfully`)
    process.exit(0)
  } catch (error) {
    console.error(error)
    console.error(`[${name}] failed`)
    process.exit(1)
  }
}) as unknown as Run

run.disabled = (
  name: string,
  _func: (...args: string[]) => Promise<void> | void
) => {
  console.log(`[${name}] disabled`)
  unused$(_func)
}
