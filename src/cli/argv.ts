import yargs from 'yargs'
import { LogLevel } from '../lib/utils/logger'

interface argv {
  crawler?: boolean
  server?: boolean
  purge?: boolean
  loglevel: LogLevel
}

const argv_ = yargs
  .option('crawler', {
    alias: 'c',
    type: 'boolean',
    describe: 'Boot your darkcrawler instance.'
  })
  .option('server', {
    alias: 's',
    type: 'boolean',
    describe: 'Boot a darkcrawler api server.'
  })
  .option('purge', {
    alias: 'p',
    type: 'boolean',
    describe: 'Purge your local dark link database.'
  })
  .option('loglevel', {
    alias: 'l',
    type: 'string',
    choices: ['d', 'i', 'w', 'e', 'o'],
    describe: 'Set the process\' log level. Applies to both the server and the crawler instance.'
  })
  .help().argv

async function argv(): Promise<argv> {
  const args = await argv_

  return {
    ...args,
    loglevel: getLoglevel(args.loglevel)
  }
}

export function getLoglevel(arg?: string): LogLevel {
  switch(arg) {
    case 'd':
      return LogLevel.debug
    case 'i':
      return LogLevel.info
    case 'w':
      return LogLevel.warning
    case 'e':
      return LogLevel.error
    case 'o':
      return LogLevel.off
    default:
      return LogLevel.default
  }
}

export default argv
