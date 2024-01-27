import { Document, MongoClient, OptionalUnlessRequiredId } from 'mongodb'
import { Err, Ok, Result } from 'ts-results'

import { safe } from '@/utils'

export class StorageDocRepo {
  client: MongoClient

  constructor(dbConnectionUrl: string) {
    this.client = new MongoClient(dbConnectionUrl)
  }

  async connect(): Promise<Result<void, string>> {
    const response = await safe(this.client.connect())
    if (response.err) {
      return Err(`failed to connect storage doc repo: ${response.val}`)
    }

    return Ok(undefined)
  }

  async disconnect(): Promise<Result<void, string>> {
    const response = await safe(this.client.close())
    if (response.err) {
      return Err(`failed to disconnect storage doc repo: ${response.val}`)
    }

    return Ok(undefined)
  }

  async insertOne<T extends Document>(
    dbName: string,
    collectionName: string,
    document: OptionalUnlessRequiredId<T>
  ): Promise<Result<void, string>> {
    const collection = this.client.db(dbName).collection<T>(collectionName) // .insertOne(document)
    const response = await safe(collection.insertOne(document))
    if (response.err) {
      return Err(`failed to insert into storage doc repo: ${response.val}`)
    }

    return Ok(undefined)
  }

  async aggregateMany<T extends Document>(
    dbName: string,
    collectionName: string,
    pipeline: T[]
  ): Promise<Result<T[], string>> {
    const collection = this.client.db(dbName).collection<T>(collectionName)
    const response = await safe(collection.aggregate<T>(pipeline).toArray())
    return response.mapErr((err) => `failed to aggregate data: ${err}`)
  }
}
