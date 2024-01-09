export type DbErrorType = 'notfound' | 'internal'
export type DbError = {
  type: DbErrorType
  message: string
}
