import { ZodError, ZodTypeDef, z } from 'zod'
import { Result, Err, Ok, Option, None, Some } from 'ts-results'
import { CronJob } from 'cron'

export * from './misc'
export * from './logger'

export async function safe<T>(promise: Promise<T>): Promise<Result<T, string>> {
  try {
    const data = await promise
    return Ok(data)
  } catch (error: unknown) {
    if (typeof error === 'string') {
      return Err(error)
    } else if (error instanceof Error) {
      return Err(`${error.name}: ${error.message}`)
    } else {
      return Err(JSON.stringify(error))
    }
  }
}

export async function safeWithError<T, E = Error>(
  promise: Promise<T>
): Promise<Result<T, E>> {
  try {
    const data = await promise
    return Ok(data)
  } catch (error: unknown) {
    return Err(error as E)
  }
}

export function parseData<I, O>(
  data: unknown,
  schema: z.Schema<O, ZodTypeDef, I>
): Result<O, ZodError<I>> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    return Err(parsed.error)
  }

  return Ok(parsed.data)
}

export function now() {
  return Math.floor(Date.now() / 1000)
}
export function nowMs() {
  return Date.now()
}

export function* keyOf<K extends string, V>(obj: Record<K, V>): Generator<K> {
  for (const el of Object.keys(obj)) {
    yield el as K
  }
}

export async function timePromise<T>(
  promise: Promise<T>
): Promise<[T, number]> {
  const start = Date.now()
  const val = await promise
  const end = Date.now()
  return [val, end - start]
}

export function randomElement<T>(arr: T[]): Option<T> {
  if (arr.length === 0) return None

  const range = arr.length
  const index = Math.floor(Math.random() * (range - 1))
  return Some(arr[index]!)
}

interface Timer {
  start: number
}

export function startTimer(): Timer {
  return {
    start: nowMs(),
  }
}

export function endTimer(timer: Timer): number {
  return nowMs() - timer.start
}

export function createAndRunCronJob(
  cronTime: string,
  executer: () => Promise<boolean>
): void {
  new CronJob({
    cronTime,
    async onTick() {
      try {
        const response = await executer()
        if (!response) {
          logger.error('Problem to execute cron job')
        }
      } catch (error) {
        logger.error('Problem to execute cron job', error)
      }
    },
  })
}
