import ErrorStack from './errorstack'
import Logger from './logger'

export function getDomainAndPath(link: string): {
  domain: string
  path: string
} {
  const { protocol, hostname, pathname, search } =
    new URL(link)

    return {
      domain: protocol + '//' + hostname,
      path: pathname + search
    }
}

export function waitFactory<T extends Function>(
  callback: T,
  howLong: number
): () => Promise<T> {
  Logger.debug<any>('Wait function called', callback, howLong)
  return () => new Promise((resolve) => {
    setTimeout(() => resolve(callback), howLong)
  })
}

export class HandleError {
  protected handleError<E extends { message?: string }>(
    ...e: E[]
  ): void {
    Logger.error(...e)
    ErrorStack.instance.addError()
  }
}

export type Maybe<T> = T | undefined | null

export function panic<E>(exitCode: number, ...e: E[]): never {
  Logger.error(...e)
  return process.exit(exitCode)
}
