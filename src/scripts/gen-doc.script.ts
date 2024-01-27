import { Documentation } from 'express-zod-api'
import fs from 'fs'

import { config } from '@/config'

import { run } from '@/utils'
import { env } from '@/env'
import { routing } from '@/routing'

run('generating docs', () => {
  const yamlString = new Documentation({
    routing,
    config,
    version: '1.0',
    title: 'Polysplit RPC',
    serverUrl: env.HOST,
    composition: 'components',
  }).getSpecAsYaml()
  fs.writeFileSync('./openapi.yml', yamlString)
})
