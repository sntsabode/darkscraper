import inquirer from 'inquirer'
import argv from './argv'
import colors from '../lib/utils/colors'
import { ICoreConfiguration } from '../lib/core'
import configureMenu, { askForBaseQueriesBeginPages, fetchOrAskForCoreConfig } from './config'
import { saveCoreConfigFile } from './config/core.config'
import { bootThread } from './threads/manager'
import crawler from '../lib'
import Logger, { LogLevel } from '../lib/utils/logger'
import { connectMongo, disconnectMongo, dropDatabase } from '../lib/utils/mongoose'

export default async function cli() {
  console.log(`\n${Title}\n`)

  const argv = await processArgs()
  const coreConfig = await fetchOrAskForCoreConfig()

  return main(argv, coreConfig)
}

async function main(
  argv: argv,
  coreConfiguration: ICoreConfiguration
) {
  if (argv.purge) {
    await purgeDatabase()
  }

  if (argv.crawler && argv.server) {
    return runCrawlerAndServerInSeperateThreads(coreConfiguration, argv.loglevel)
  } else if (argv.crawler) {
    return crawler(coreConfiguration, argv.loglevel)
  } else if (argv.server) {
    return
  }

  return
}

function runCrawlerAndServerInSeperateThreads(
  coreConfig: ICoreConfiguration,
  logLevel: LogLevel
) {
  const processes: (() => Promise<any>)[] = []

  const pathToCrawlerEntryPoint = './dist/cli/threads/crawler.worker'
  processes.push(() => bootThread(pathToCrawlerEntryPoint, { coreConfig, logLevel }))

  return Promise.all(processes.map(process => process()))
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

async function processArgs() {
  let args = await argv()

  if (args.purge) {
    const confirmPurge = await askForPurgeConfirmation()
    if (!confirmPurge) {
      console.log(...colors.green('? Opted not to purge database.'))
    } else {
      console.warn(...colors.red('? Opted to purge database.'))
    }

    args.purge = confirmPurge

    return args
  }

  if (args.configure) {
    await configureMenu()
  }

  if (args.yes) {
    getDefaultArgs(args)

    return args
  }

  if (!args.server && !args.crawler) {
    const answers = await askForServerCrawlerArgs()

    args.crawler = answers.crawler
    args.server = answers.server
  }

  if (args.queries) {
    const baseQueries = await askForBaseQueriesBeginPages(args.queries)
    await saveCoreConfigFile({ baseQueries } as ICoreConfiguration, true)
  }

  return args
}

function getDefaultArgs(argv: argv) {
  if (!argv.crawler && !argv.server) {
    argv.crawler = true
  }
}

interface IInquirerQuestions {
  crawlerServerArgs: [string, string]
  purgeConfirmation: boolean
  baseQueryPageNumber: number
  coreConfig: ICoreConfiguration
}

async function askForPurgeConfirmation() {
  console.log()

  const { purgeConfirmation } = await inquirer.prompt<IInquirerQuestions>([
    {
      name: 'purgeConfirmation',
      type: 'confirm',
      message: colors.red('Purge argument was passed in. Are you sure you want to delete every dark link stored in your database?')[0]
    }
  ])

  return purgeConfirmation
}

async function askForServerCrawlerArgs() {
  console.log()

  const args = await inquirer.prompt<IInquirerQuestions>([
    {
      name: 'crawlerServerArgs',
      type: 'checkbox',
      message: 'Please check the process(es) you would like to run.',
      choices: ['Crawler', 'Server']
    }
  ]).then(
    ({ crawlerServerArgs }) => crawlerServerArgs.map(a => a.toLowerCase()),
    e => { throw e }
  )

  const crawler = args.includes('crawler')
  const server = args.includes('server')

  if (!crawler && !server) {
    throw new Error('Have to select at least one process')
  }

  return { crawler, server }
}

const [Title] = colors.cyan(
  `
#####    ##   #####  #    #  ####   ####  #####    ##   #####  ###### #####
#    #  #  #  #    # #   #  #      #    # #    #  #  #  #    # #      #    #
#    # #    # #    # ####    ####  #      #    # #    # #    # #####  #    #
#    # ###### #####  #  #        # #      #####  ###### #####  #      #####
#    # #    # #   #  #   #  #    # #    # #   #  #    # #      #      #   #
#####  #    # #    # #    #  ####   ####  #    # #    # #      ###### #    #
`.trim()
)
