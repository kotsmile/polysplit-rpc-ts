export type DbErrorType = 'NOT_FOUND' | 'ERROR'

export type DbError = {
  type: DbErrorType
  message: string
}
