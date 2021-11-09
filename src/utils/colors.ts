const colors = {
  red: <T>(...msg: T[]): string[] =>
    msg.map(msg => `\x1b[31m${msg}${colors.reset}`),

  green: <T>(...msg: T[]): string[] =>
    msg.map(msg => `\x1b[32m${msg}${colors.reset}`),

  yellow: <T>(...msg: T[]): string[] =>
    msg.map(msg => `\x1b[33m${msg}${colors.reset}`),

  blue: <T>(...msg: T[]): string[] =>
    msg.map(msg => `\x1b[34m${msg}${colors.reset}`),

  magenta: <T>(...msg: T[]): string[] =>
    msg.map(msg => `\x1b[35m${msg}${colors.reset}`),

  cyan: <T>(...msg: T[]): string[] =>
    msg.map(msg => `\x1b[36m${msg}${colors.reset}`),

  white: <T>(...msg: T[]): string[] =>
    msg.map(msg => `\x1b[37m${msg}${colors.reset}`),

  blink: <T>(...msg: T[]): string[] =>
    msg.map(msg => `\x1b[5m${msg}${colors.reset}`),

  reset: '\x1b[0m'
}

export default colors

export const [[yes], [no]] = [
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  colors.green('(Y | y)')!,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  colors.red('(N | n)')!
]
