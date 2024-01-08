import { Documentation } from 'express-zod-api'
import fs from 'fs'
import path from 'path'

import { config } from '@/config'

import { generateRouting } from '@/utils/auto-routes'

import { run } from '@/utils'
import env from '@/env'

run('generating docs', () => {
  const yamlString = new Documentation({
    routing: generateRouting(path.join(__dirname, '../routes')),
    config,
    version: '1.0',
    title: 'Gotbit Service Chacker API',
    serverUrl: env.HOST,
    composition: 'inline',
  }).getSpecAsYaml()
  fs.writeFileSync('./openapi.yml', yamlString)
})
