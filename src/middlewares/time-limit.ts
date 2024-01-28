import { NextFunction, Request, Response } from 'express'

export function timeLimit(limit: number, perPeriod: number) {
  let requests = 0
  setTimeout(() => (requests = 0), perPeriod)
  return (_req: Request, res: Response, next: NextFunction) => {
    requests++
    if (requests > limit) {
      return res.status(429).send('Too many requests')
    } else {
      return next()
    }
  }
}
