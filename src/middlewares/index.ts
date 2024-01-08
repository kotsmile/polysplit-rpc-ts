import { createMiddleware } from 'express-zod-api'
import { z } from 'zod'
//
// import { verifyJWT } from '@/services/jwt'
// import { findUserByEmail } from '@/services/db/user'
// import env from '@/env'

// const UnauthorizedError = createHttpError(401, 'Unauthorized')

// export function hasRole(...roles: UserRole[]) {
//   return createMiddleware({
//     security: {
//       and: [{ type: 'header', name: 'Authorization' }],
//     },
//     input: z.object({}),
//     async middleware({ request }) {
//       const authorizationHeader = request.headers.authorization
//
//       if (authorizationHeader === undefined) {
//         throw createHttpError(401, 'Missing authorization header')
//       }
//
//       const token = authorizationHeader.replace('Bearer ', '')
//       const payload = verifyJWT(token)
//       if (payload.err) {
//         throw UnauthorizedError
//       }
//
//       const { email } = payload.val
//       const userRoles = await getUserRolesByEmail(email)
//
//       if (roles.length === 0) {
//         return { email, roles: userRoles }
//       }
//
//       if (userRoles.length === 0) {
//         throw UnauthorizedError
//       }
//       if (!roles.some((role) => userRoles.includes(role))) {
//         throw UnauthorizedError
//       }
//       if (email.split('@')[1] !== env.EMAIL_DOMAIN) {
//         throw UnauthorizedError
//       }
//
//       return { email, roles: userRoles }
//     },
//   })
// }

export const setHeaders = createMiddleware({
  input: z.object({}),
  async middleware({ response }) {
    return {
      setHeader: (name: string, value: string) => response.cookie(name, value),
    }
  },
})
