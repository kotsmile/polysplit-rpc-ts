// import { run, safe } from '@/utils'
// import { MongoClient } from 'mongodb'
// import { statsService, storageRepo } from '@/impl'
// import { StatsStatus } from '@prisma/client'
//
// run('migrated date', async () => {
//   const connectionString =
//     'mongodb+srv://doadmin:z58sxu207XkH631C@polysplit-rpc-mongodb-3dd0e432.mongo.ondigitalocean.com/admin?tls=true&authSource=admin'
//   const mongoClient = new MongoClient(connectionString)
//   await mongoClient.connect()
//
//   const documents = mongoClient.db('main').collection('stats').find()
//   const batch = 5000
//   let recs = []
//   for await (const doc of documents) {
//     const rec = {
//       ip: (doc.ip ?? '') as string,
//       status: doc.status === 'ok' ? StatsStatus.OK : StatsStatus.ERROR,
//       chainId: (doc.chainId ?? '') as string,
//       attempts: (doc.attempts ?? -1) as number,
//       isLanding: (doc.attempts ?? false) as boolean,
//       choosenRpc: (doc.choosenRpc ?? '') as string,
//       errorMessage: (doc.errorMessage ?? '') as string,
//       responseTimeMs: (doc.responseTimeMs ?? -1) as number,
//       created_at: (doc.date as string) !== '' ? new Date(doc.date) : new Date(),
//     }
//
//     if (rec.created_at.toString() <= '2024-01-27T20:47:11.000Z') {
//       continue
//     }
//
//     recs.push(rec)
//     if (recs.length >= batch) {
//       const response = await safe(
//         storageRepo.client.stats.createMany({
//           data: recs,
//         })
//       )
//       console.log(
//         recs[recs.length - 1]?.created_at,
//         response.map((v) => v.count)
//       )
//       if (response.err) {
//         await mongoClient.close()
//         return
//       }
//       recs = []
//     }
//     // const response = await statsService.insertStats(rec)
//     // console.log(response.val)
//   }
//
//   const response = await safe(
//     storageRepo.client.stats.createMany({
//       data: recs,
//     })
//   )
//   console.log(response.map((v) => v.count))
//
//   await mongoClient.close()
// })
