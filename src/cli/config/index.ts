import { unlinkSync } from 'fs'
import inquirer from 'inquirer'
import { createInterface } from 'readline'
import { ICoreConfiguration } from '../../lib/core'
import { IBaseQueries } from '../../lib/core/Reconnaissance'
import { coreConfigPath } from '../../lib/dirs'
import { isObjectEmpty } from '../../lib/utils'
import colors from '../../lib/utils/colors'
import Logger from '../../lib/utils/logger'
import { prompt } from '../utils'
import { fetchCoreConfigFile, saveCoreConfigFile, validateCoreConfig } from './core.config'

export type IConfigOption =
  | 'purge'
  | 'crawler'
  | 'queries'
  | 'log'
  | 'exit'

export default async function configureMenu() {
  logIntro()

  let work = true

  while (work) {
    const option = await ask('darkscraper::configure>') as IConfigOption
    if (option === 'purge') {
      await purgeOption()
    } else if (option === 'crawler') {
      await crawlerOption()
    } else if (option === 'queries') {
      await queriesOption()
    } else if (option === 'log') {
      await logOption()
    } else if (option === 'exit') {
      work = false
    }
  }
}

async function queriesOption() {
  const coreConfig = fetchCoreConfigFile()
  if (isObjectEmpty(coreConfig)) {
    Logger.error('No crawler configuraion was found')
    Logger.error('Run the crawler command to configure your crawler instance.')

    return
  }

  Logger.info(...colors.cyan('queries'), 'selected. You can run the following commands:')
  console.log(tab, 'add', tab, '-- Add a new query to the base queries object')
  if (!isObjectEmpty(coreConfig.baseQueries)) {
    for (const [query] of Object.entries(coreConfig.baseQueries)) {
      console.log(tab, ...colors.cyan(query), tab, '-- Configure your', query, 'query')
    }
  }
  console.log(tab, ...colors.green('exit') , '|', ...colors.green('..'), tab, '-- Exit the queries input loop')

  let work = true

  while (work) {
    const option = await ask('darkscraper::configure::queries>')
    if (option === 'add') {
      const query = await prompt('input', 'Enter the query')
      const page = await prompt('number', `Please enter the page you would like the searches for ${colors.cyan(query)[0]} to begin from`)
      coreConfig.baseQueries[query] = page
    } else if (coreConfig.baseQueries.hasOwnProperty(option)) {
      await queriesOptionWorker(coreConfig.baseQueries, option)
    } else if (option === 'exit' || option === '..') {
      work = false
    }
  }

  await saveCoreConfigFile(coreConfig, true)
}

async function queriesOptionWorker(baseQueries: IBaseQueries, query: string) {
  Logger.info(...colors.cyan(query), 'selected. You can run the following commands:')
  console.log(tab, ...colors.red('delete'), tab, '-- Delete the query')
  console.log(tab, 'page', tab, '-- Configure the searches page number (where the Reconnaissance begins its calls for', `${query})`)
  console.log(tab, ...colors.green('exit'), '|', ...colors.green('..'), tab, '-- Exit the queries input loop')

  const log = `darkscraper::configure::queries::${query}>`
  let work = true

  while (work) {
    const option = await ask(log)
    if (option === 'page') {
      const page = await prompt('number', 'Enter the page number')
      baseQueries[query] = page
      work = false
    } else if (option === 'delete') {
      const confirm = await prompt('confirm', `Are you sure you want to delete the ${colors.cyan(query)} query?`)
      if (!confirm) { continue }

      delete baseQueries[query]
      work = false
    } else if (option === 'exit' || option === '..') {
      work = false
    }
  }
}

async function purgeOption() {
  Logger.info(...colors.red('purge'), 'selected. You can run the following commands:')
  console.log(tab, ...colors.red('crawler'), tab, '-- Delete your', ...colors.cyan('crawler configuration'))
  console.log(tab, ...colors.red('server'), tab, '-- Delete your', ...colors.cyan('server configuration'))
  console.log(tab, ...colors.green('exit'), '|', ...colors.green('..'), tab, '-- Exit the purge input loop')

  const log = `darkscraper::configure::${colors.red('purge')[0]}>`
  let work = true

  while (work) {
    const option = await ask(log)
    if (option === 'crawler') {
      await purgeOptionWorker(coreConfigPath, option)
      work = false
    } else if (option === 'server') {
      await purgeOptionWorker('', option)
      work = false
    } else if (option === 'exit' || option === '..') {
      work = false
    } else {
      Logger.error('Entered an invalid option')
      Logger.error('Please enter', ...colors.green('crawler'), 'or', ...colors.green('server'))
    }
  }
}

async function purgeOptionWorker(pathToConfigFile: string, option: string) {
  const confirmation = await prompt('confirm', `Are you sure you want to purge your ${colors.red(option)[0]} configuration`)
  if (!confirmation) { return }

  deleteAndLogENOENT(pathToConfigFile, option)
}

async function crawlerOption() {
  const config = await askForCoreConfig()
  await saveCoreConfigFile(config, true)
}

async function logOption() {
  Logger.info(...colors.cyan('log'), 'selected. You can run the following commands:')
  console.log(tab, 'crawler', tab, '-- Log your', ...colors.cyan('crawler configuration'))
  console.log(tab, 'server', tab, '-- Loge your', ...colors.cyan('server configuration'))
  console.log(tab, ...colors.green('exit'), '|', ...colors.green('..'), tab, '-- Exit the log input loop')

  let work = true

  while (work) {
    const option = await ask('darkscraper::configure::log>')
    if (option === 'crawler') {
      logCoreConfigFile()
      work = false
    } else if (option === 'server') {
      work = false
    } else if (option === 'exit' || option === '..') {
      work = false
    } else {
      Logger.error('Entered an invalid option')
      Logger.error('Please enter', ...colors.green('crawler'), 'or', ...colors.green('server'))
    }
  }
}

function logCoreConfigFile() {
  const coreConfig = fetchCoreConfigFile()

  Logger.info('Crawler configuration:')

  console.log(tab, 'Panic trigger:', ...colors.white(coreConfig?.panicTrigger))
  console.log(tab, 'Recon throttle:', ...colors.white(coreConfig?.reconThrottle))
  console.log(tab, 'Infil throttle:', ...colors.white(coreConfig?.infilThrottle))
  console.log(tab, 'Infil wait before run time:', ...colors.white(coreConfig?.infilWaitBeforeRunTime))
  if (coreConfig?.baseQueries) {
    console.log(tab, 'Base queries:')
    for (const [query, page] of Object.entries(coreConfig?.baseQueries)) {
      console.log(`${tab}${tab}`, 'Query:', ...colors.cyan(query))
      console.log(`${tab}${tab}`, 'Page:', page, '\n')
    }
  } else {
    console.log(tab, 'Base queries:', ...colors.white(undefined), '\n')
  }
}

function deleteAndLogENOENT(path: string, which: string) {
  try {
    unlinkSync(path)
  } catch (e: any) {
    if (e.code !== 'ENOENT') { throw e }

    Logger.error(`Could not find a ${colors.red(which)[0]} configuration file.`)
  }
}

export async function fetchOrAskForCoreConfig() {
  let config = fetchCoreConfigFile()

  if (!isObjectEmpty(config)) {
    const { validated, reason } = validateCoreConfig(config)

    if (!validated) {
      throw new Error(reason)
    }

    return config
  }

  config = await askForCoreConfig()
  await saveCoreConfigFile(config, false)

  return config
}

export async function askForCoreConfig() {
  const val = await inquirer.prompt<ICoreConfiguration>([
    {
      name: 'panicTrigger',
      type: 'number',
      message: 'Please enter a panic trigger. (Number of errors until a panic is triggered)'
    },
    {
      name: 'reconThrottle',
      type: 'number',
      message: 'Please enter a recon throttle. (How long to wait between each call when running Reconnaissance)'
    },
    {
      name: 'infilThrottle',
      type: 'number',
      message: 'Please enter an infil throttle. (How long to wait between calls when running the Infiltrator)'
    },
    {
      name: 'infilWaitBeforeRunTime',
      type: 'number',
      message: 'Please enter an "infil wait before run time". (How long the Infiltrator should wait before running. (Reconnaissance running in the background))'
    },
    {
      name: 'baseQueries',
      type: 'input',
      message: 'Please enter base queries seperated by a comma (,). (Search queries used to fetch base links to begin crawling).\n',
      filter: (input: string) => (input.split(',').map(
        input => input.trim()
      ))
    }
  ])

  val.baseQueries = await askForBaseQueriesBeginPages(
    val.baseQueries as unknown as string[]
  )

  return val
}

export async function askForBaseQueriesBeginPages(
  queries: string[]
): Promise<IBaseQueries> {
  const obj: IBaseQueries = { }

  for (const query of queries) {
    obj[query] = await prompt('number', `Please enter the page you would like the searches for ${colors.cyan(query)[0]} to begin from.`)
  }

  return obj
}

export async function ask(log: string): Promise<string> {
  const read = createInterface(process.stdin, process.stdout)
  return new Promise((resolve) => {
    read.question(log, a => {
      read.close()
      resolve(a)
    })
  })
}

const tab = '    '

function logIntro() {
  Logger.info('You have entered the', ...colors.cyan('configure menu'), 'You can run the following commands:')
  console.log(`${tab}${colors.red('purge')[0]} ${tab} -- Delete configuration files`)
  console.log(`${tab}crawler ${tab} -- Configure your crawler instance`)
  console.log(`${tab}queries ${tab} -- Configure your base queries`)
  console.log(`${tab}log ${tab} -- Log your configuration files`)
  console.log(`${tab}${colors.green('exit')[0]} ${tab} -- Exit the configure menu`)

  console.log()
}
