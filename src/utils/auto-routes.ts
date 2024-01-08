import fsNode from 'fs'
import pathNode from 'path'

import { DependsOnMethod, AbstractEndpoint, ServeStatic } from 'express-zod-api'
import type { Routing } from 'express-zod-api'
import { z } from 'zod'

import { logger } from '@/utils'

const MethodSchema = z.enum(['get', 'post', 'put', 'patch', 'delete'])
type Method = z.infer<typeof MethodSchema>

const FileNameWithNameSchema = z.tuple([z.string(), MethodSchema, z.string()])
const FileNameWithoutNameSchema = z.tuple([MethodSchema, z.string()])

type Handler = AbstractEndpoint | ServeStatic

type Route = {
  path: string[]
  handler: Handler
  method: Method
}

function getRoutes(routeDir: string, splitPath: string[] = []): Route[] {
  const routes: Route[] = []

  const files = fsNode.readdirSync(routeDir)
  for (const fileName of files) {
    if (fileName.startsWith('-')) {
      continue
    }

    // convert [id].ts to :id.ts
    const formattedFileName = fileName.replace('[', ':').replace(']', '')

    const filePath = pathNode.join(routeDir, fileName)

    if (fsNode.statSync(filePath).isDirectory()) {
      routes.push(...getRoutes(filePath, [...splitPath, formattedFileName]))
    } else {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const handler = require(filePath).default as unknown

      if (
        !(handler instanceof AbstractEndpoint) &&
        !(handler instanceof ServeStatic)
      ) {
        logger.warn(
          `Invalid handler: ${filePath}, should be an AbstractEndpoint or ServeStatic`
        )
        continue
      }

      const parts = formattedFileName.split('.')

      const parsedFileNameWithName = FileNameWithNameSchema.safeParse(parts)
      const parsedFileNameWithoutName =
        FileNameWithoutNameSchema.safeParse(parts)
      if (parsedFileNameWithName.success) {
        const [name, method] = parsedFileNameWithName.data
        routes.push({
          path: [...splitPath, name],
          handler,
          method,
        })
      } else if (parsedFileNameWithoutName.success) {
        const [method] = parsedFileNameWithoutName.data
        routes.push({
          path: [...splitPath],
          handler,
          method,
        })
      } else {
        logger.warn(
          `Invalid file name: ${fileName} in ${filePath}, should match *.method.{ts,js} or method.{ts,js}`
        )
      }
    }
  }

  return routes
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function putInObject(obj: any, value: any, splitPath: string[]): void {
  const lastKey = splitPath.pop()!
  const lastObj = splitPath.reduce((obj, key) => {
    if (obj[key] === undefined) {
      obj[key] = {}
    }
    return obj[key]
  }, obj)
  lastObj[lastKey] = value
}

export function generateRouting(routeDir: string): Routing {
  const routes = getRoutes(routeDir)
  const routing: Routing = {}

  const routeGroups: Record<string, Route[]> = {}

  for (const route of routes) {
    const key = route.path.join('/')
    const routeGroup = routeGroups[key]
    if (routeGroup === undefined) {
      routeGroups[key] = [route]
    } else {
      routeGroup.push(route)
    }
  }

  for (const [, routeGroup] of Object.entries(routeGroups)) {
    if (routeGroup.length === 1) {
      const handler = routeGroup[0]!.handler
      putInObject(routing, handler, [...routeGroup[0]!.path, ''])
    } else {
      const handler = new DependsOnMethod(
        Object.fromEntries(routeGroup.map((r) => [r.method, r.handler]))
      )
      putInObject(routing, handler, [...routeGroup[0]!.path, ''])
    }
  }

  return routing
}
