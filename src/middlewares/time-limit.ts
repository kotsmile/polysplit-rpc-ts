import { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'

export function timeLimit(limit: number, per: number) {
  let requests = 0
  setTimeout(() => (requests = 0), per)
  return (_req: Request, _res: Response, next: NextFunction) => {
    requests++
    if (requests > limit) {
      next(createHttpError.TooManyRequests('Too many requests'))
    } else {
      next()
    }
  }
}
