import Logger from './logger'

export function panic<E>(exitCode: number, ...e: E[]): never {
  Logger.error(...e)
  return process.exit(exitCode)
}
