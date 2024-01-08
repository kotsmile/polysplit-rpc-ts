import { ZodError, ZodTypeDef, z } from 'zod'
import { Result, Err, Ok } from 'ts-results'
import { CronJob } from 'cron'

import { logger } from './logger'

export * from './misc'
export * from './run'
export * from './logger'

export async function safe<T, E = Error>(
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

export type ResultResponse<T> = Result<T, { code: number; error: string }>

export function createAndRunCronJob(
  cronTime: string,
  executer: () => Promise<boolean>
): void {
  new CronJob(
    cronTime,
    async () => {
      try {
        const response = await executer()
        if (!response) {
          logger.error('Problem to execute cron job')
        }
      } catch (error) {
        logger.error('Problem to execute cron job', error)
      }
    },
    undefined,
    true
  )
}
