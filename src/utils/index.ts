import { ZodError, ZodTypeDef, z } from 'zod'
import { Result, Err, Ok, Option, None, Some } from 'ts-results'

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

export function randomElement<T>(arr: T[]): Option<T> {
  if (arr.length === 0) return None

  const range = arr.length
  const index = Math.floor(Math.random() * (range - 1))
  return Some(arr[index]!)
}
