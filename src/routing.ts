import path from 'path'

import { generateRouting } from '@/utils/auto-routes'

export const routing = generateRouting(path.join(__dirname, './routes'))
