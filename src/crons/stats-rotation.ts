import { statsService } from '@/impl'
import { createAndRunCronJob } from '@/utils'

async function statsRotationCron(): Promise<boolean> {
  return await statsService.rotate().then((v) => v.ok)
}

createAndRunCronJob('0 0 */3 * *', statsRotationCron)
