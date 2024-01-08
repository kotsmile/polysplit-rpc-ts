import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core'
import { z } from 'zod'

const PatchApiServiceId_Body = z
  .object({})
  .partial()
  .passthrough()
  .and(
    z
      .object({
        service: z
          .object({
            name: z.string(),
            client: z.string(),
            url: z.string(),
            method: z.enum(['GET', 'POST']),
            tags: z.array(z.string()),
            type: z.enum(['FRONTEND', 'BACKEND']),
            response_example: z.string(),
          })
          .partial()
          .passthrough(),
      })
      .passthrough()
  )
const PostApiServices_Body = z
  .object({})
  .partial()
  .passthrough()
  .and(
    z
      .object({
        service: z
          .object({
            name: z.string(),
            client: z.string(),
            url: z.string(),
            method: z.enum(['GET', 'POST']),
            tags: z.array(z.string()),
            type: z.enum(['FRONTEND', 'BACKEND']),
            response_example: z.string(),
          })
          .passthrough(),
      })
      .passthrough()
  )

export const schemas = {
  PatchApiServiceId_Body,
  PostApiServices_Body,
}

const endpoints = makeApi([
  {
    method: 'get',
    path: '/api/health',
    alias: 'GetApiHealth',
    requestFormat: 'json',
    response: z
      .object({
        status: z.literal('success'),
        data: z.object({ status: z.string() }).passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `GET /api/health Error response`,
        schema: z
          .object({
            status: z.literal('error'),
            error: z.object({ message: z.string() }).passthrough(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: 'delete',
    path: '/api/service/:id',
    alias: 'DeleteApiServiceId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal('success'),
        data: z.object({}).partial().passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `DELETE /api/service/:id Error response`,
        schema: z
          .object({
            status: z.literal('error'),
            error: z.object({ message: z.string() }).passthrough(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: 'patch',
    path: '/api/service/:id',
    alias: 'PatchApiServiceId',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `PATCH /api/service/:id request body`,
        type: 'Body',
        schema: PatchApiServiceId_Body,
      },
      {
        name: 'id',
        type: 'Path',
        schema: z.string(),
      },
    ],
    response: z
      .object({
        status: z.literal('success'),
        data: z
          .object({
            service: z
              .object({
                id: z.string(),
                name: z.string(),
                client: z.string(),
                url: z.string(),
                method: z.enum(['GET', 'POST']),
                tags: z.array(z.string()),
                type: z.enum(['FRONTEND', 'BACKEND']),
                checked_at: z
                  .number()
                  .int()
                  .gte(-9007199254740991)
                  .lte(9007199254740991),
                status: z.enum(['NONE', 'OK', 'ERROR']),
                timeout: z
                  .number()
                  .int()
                  .gte(-9007199254740991)
                  .lte(9007199254740991),
                response_example: z.string(),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `PATCH /api/service/:id Error response`,
        schema: z
          .object({
            status: z.literal('error'),
            error: z.object({ message: z.string() }).passthrough(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: 'get',
    path: '/api/services',
    alias: 'GetApiServices',
    requestFormat: 'json',
    response: z
      .object({
        status: z.literal('success'),
        data: z
          .object({
            services: z.array(
              z
                .object({
                  id: z.string(),
                  name: z.string(),
                  client: z.string(),
                  url: z.string(),
                  method: z.enum(['GET', 'POST']),
                  tags: z.array(z.string()),
                  type: z.enum(['FRONTEND', 'BACKEND']),
                  checked_at: z
                    .number()
                    .int()
                    .gte(-9007199254740991)
                    .lte(9007199254740991),
                  status: z.enum(['NONE', 'OK', 'ERROR']),
                  timeout: z
                    .number()
                    .int()
                    .gte(-9007199254740991)
                    .lte(9007199254740991),
                  response_example: z.string(),
                })
                .passthrough()
            ),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `GET /api/services Error response`,
        schema: z
          .object({
            status: z.literal('error'),
            error: z.object({ message: z.string() }).passthrough(),
          })
          .passthrough(),
      },
    ],
  },
  {
    method: 'post',
    path: '/api/services',
    alias: 'PostApiServices',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        description: `POST /api/services request body`,
        type: 'Body',
        schema: PostApiServices_Body,
      },
    ],
    response: z
      .object({
        status: z.literal('success'),
        data: z
          .object({
            service: z
              .object({
                id: z.string(),
                name: z.string(),
                client: z.string(),
                url: z.string(),
                method: z.enum(['GET', 'POST']),
                tags: z.array(z.string()),
                type: z.enum(['FRONTEND', 'BACKEND']),
                checked_at: z
                  .number()
                  .int()
                  .gte(-9007199254740991)
                  .lte(9007199254740991),
                status: z.enum(['NONE', 'OK', 'ERROR']),
                timeout: z
                  .number()
                  .int()
                  .gte(-9007199254740991)
                  .lte(9007199254740991),
                response_example: z.string(),
              })
              .passthrough(),
          })
          .passthrough(),
      })
      .passthrough(),
    errors: [
      {
        status: 400,
        description: `POST /api/services Error response`,
        schema: z
          .object({
            status: z.literal('error'),
            error: z.object({ message: z.string() }).passthrough(),
          })
          .passthrough(),
      },
    ],
  },
])

export const api = new Zodios(endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options)
}
