import argv from '../argv'
import { bootThread } from '../threads/manager'
import crawler from '../../lib'
import Logger from '../../lib/utils/logger'
import colors from '../../lib/utils/colors'
import { connectMongo, disconnectMongo, dropDatabase } from '../../lib/utils/mongoose'
import { ICoreConfiguration } from '../../lib/core'

export default async function mothership(
  argv: argv,
  coreConfiguration: ICoreConfiguration
) {
  if (argv.purge) {
    await purgeDatabase()
  }

  if (argv.crawler && argv.server) {
    const processes: (() => Promise<any>)[] = []

    const pathToCrawlerEntryPoint = './dist/cli/mothership/crawler.worker'
    processes.push(() => bootThread(pathToCrawlerEntryPoint, coreConfiguration))

    return Promise.all(processes.map(process => process()))
  } else if (argv.crawler) {
    return crawler(coreConfiguration)
  } else if (argv.server) {
    return
  }

  return
}

async function purgeDatabase() {
  await connectMongo()

  const databaseDropped = await dropDatabase()
  if (!databaseDropped) {
    Logger.error('Failed to purge database.')
    console.log(
      'If you really wish to purge the database...\n',
      'Open a mongo shell by entering', ...colors.cyan('mongo'), 'in a terminal.\n',
      'Once the mongo repl is open enter the following commands in sequence to purge the darkscraper database.\n',
      '>', ...colors.cyan('show dbs\n'),
      '>', ...colors.cyan('use darkscraper\n'),
      '>', ...colors.cyan('db.dropDatabase()\n'),
      'If no error was thrown, the database was successfully purged.\n',
      'Run...\n',
      '>', ...colors.cyan('show dbs\n'),
      'again to verify the database was purged.\n'
    )
  } else {
    Logger.success('Successfully purged your local dark link database.')
  }

  return disconnectMongo()
}
