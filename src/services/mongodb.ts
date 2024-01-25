import { Collection, Db, MongoClient } from 'mongodb'
import { Err, Ok, Result } from 'ts-results'

import { env } from '@/env'
import { safe } from '@/utils'

export const mongoClient = new MongoClient(env.MONGO_DB_URL)

export interface StatisticRecord {
  status: 'ok' | 'error'
  chainId: string
  responseTimeMs: number
  choosenRpc?: string
  errorMessage?: string
  date: number
}

export async function saveRecord(
  record: StatisticRecord
): Promise<Result<void, string>> {
  const result = await safe(getStatisticCollection().insertOne(record))
  if (result.err) {
    return Err(`Failed to insert into db: ${result.val}`)
  }

  return Ok(undefined)
}

function getStatisticCollection(): Collection<StatisticRecord> {
  return getMongoDb().collection<StatisticRecord>(env.MONGO_DB_STATS_COLLECTION)
}

function getMongoDb(): Db {
  return mongoClient.db(env.MONGO_DB_NAME)
}
