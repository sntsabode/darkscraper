/* eslint-disable @typescript-eslint/no-extraneous-class */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import colors from './colors'

export type LogLevels =
  | 'debug'
  | 'default'
  | 'info'
  | 'warning'
  | 'error'
  | 'off'

export const enum LogLevel {
  debug = 1,
  default = 2,
  info = 2,
  warning = 3,
  error = 4,
  off = 5
}

export function getLogLevel(ll: LogLevels): LogLevel {
  switch (ll) {
    case 'debug':
      return LogLevel.debug
    case 'default':
      return LogLevel.default
    case 'error':
      return LogLevel.error
    case 'info':
      return LogLevel.info
    case 'warning':
      return LogLevel.warning
    case 'off':
      return LogLevel.off
    default:
      return LogLevel.default
  }
}

const tag = '[darkscraper]'
export default class Logger {
  static #logLevel: LogLevel = LogLevel.default
  static get logLevel(): LogLevel { return this.#logLevel }
  static set logLevel(ll: LogLevel) { this.#logLevel = ll }

  static #debugTag = colors.magenta(tag)[0]!
  static debug = <T>(...args: T[]) =>
    this.#log(LogLevel.debug, this.#debugTag, ...args)

  static #infoTag = colors.cyan(tag)[0]!
  static info = <T>(...args: T[]) =>
    this.#log(LogLevel.info, this.#infoTag, ...args)

  static #warningTag = colors.yellow(tag)[0]!
  static warning = <T>(...args: T[]) =>
    this.#log(LogLevel.warning, this.#warningTag, ...args)

  static #errorTag = colors.red(tag)[0]!
  static error = <T>(...args: T[]) =>
    this.#log(LogLevel.error, this.#errorTag, ...args)

  static #successTag = colors.green(tag)[0]!
  static success = <T>(...args: T[]) => {
    this.#log(LogLevel.error, this.#successTag, ...args)
  }

  static readonly #log = <T>(
    level: LogLevel,
    tag: string,
    ...args: T[]
  ): void => {
    this.#_log(level, tag, ...args)
  }

  static readonly #_log = <T>(
    level: LogLevel,
    tag: string,
    ...args: T[]
  ): void => {
    if (this.#logLevel > level)
      return

    console.log(tag, ...args)
  }

  static readonly #groupLog = <T>(
    level: LogLevel,
    tag: string,
    ...args: T[]
  ) => {
    this.#_log(level, '')

    args.forEach((arg) =>
      this.#_log(level, tag, arg)
    )

    this.#_log(level, '')
  }

  static readonly group = {
    debug: <T>(...args: T[]) =>
      this.#groupLog(LogLevel.debug, this.#debugTag, ...args),

    info: <T>(...args: T[]) =>
      this.#groupLog(LogLevel.info, this.#infoTag, ...args),

    warning: <T>(...args: T[]) =>
      this.#groupLog(LogLevel.warning, this.#warningTag, ...args),

    error: <T>(...args: T[]) =>
      this.#groupLog(LogLevel.error, this.#errorTag, ...args)
  }
}
