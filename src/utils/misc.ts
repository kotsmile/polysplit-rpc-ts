import { logger } from '.'

export function todo$(...msg: string[]): never {
  logger.error('TODO: ' + msg.join(' '))
  throw new Error('TODO: ' + msg.join(' '))
}

export function unreachable$(): never {
  throw new Error('UNREACHABLE')
}

export async function unused$(...arg: unknown[]) {
  logger.warn('Not used', arg)
}
