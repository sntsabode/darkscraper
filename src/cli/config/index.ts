import { unlinkSync } from 'fs'
import inquirer from 'inquirer'
import { createInterface } from 'readline'
import { ICoreConfiguration } from '../../lib/core'
import { IBaseQueries } from '../../lib/core/Reconnaissance'
import colors from '../../lib/utils/colors'
import Logger from '../../lib/utils/logger'
import { fetchCoreConfigFile, validateCoreConfig } from './core.config'

export const configDir = `${require('os').homedir()}/darkscraper`
export const coreConfigPath = `${configDir}/core_config.json`

export default async function configureMenu() {
  logIntro()

  let work = true

  while (work) {
    const option = await ask('darkscraper::configure>') as IConfigOption
    if (option === 'purge') {
      await purge()
    } else if (option === 'crawler') {

    } else if (option === 'exit') {
      work = false
    }
  }
}

async function purge() {
  Logger.info(...colors.red('purge'), 'selected. You can run the following commands:')
  console.log(tab, ...colors.red('crawler'), tab, '-- Delete your', ...colors.cyan('crawler configuration'))
  console.log(tab, ...colors.red('server'), tab, '-- Delete your', ...colors.cyan('server configuration'))
  console.log(tab, ...colors.green('exit'), tab, '-- Exit the purge input loop')

  let work = true

  while (work) {
    const option = await ask('darkscraper::configure::purge>')
    if (option === 'crawler') {
      const success = deleteAndLogENOENT(coreConfigPath, option)
      if (success) {
        Logger.success('Successfully deleted your crawler configuration file.')
      }
      work = false
    } else if (option === 'exit') {
      work = false
    } else if (option === 'server') {
      work = false
    } else {
      Logger.error('Entered an invalid option')
      Logger.error('Please enter', ...colors.green('crawler'), 'or', ...colors.green('server'))
    }
  }
}

function deleteAndLogENOENT(path: string, which: string): boolean {
  try {
    unlinkSync(path)

    return true
  } catch (e: any) {
    if (e.code !== 'ENOENT') { throw e }

    Logger.error(`Could not find the ${colors.red(which)[0]} configuration file.`)

    return false
  }
}

export type IConfigOption =
  | 'purge'
  | 'crawler'
  | 'exit'

export async function fetchOrAskForCoreConfig() {
  const config = fetchCoreConfigFile()

  if (config) {
    const { validated, reason } = validateCoreConfig(config)

    if (validated) { return config }
    else { throw new Error(reason) }
  }

  const val = await askForCoreConfig()

  return val
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
    obj[query] = (await inquirer.prompt<{ num: number }>([
      {
        name: 'num',
        type: 'number',
        message: `Please enter the page you would like the searches for ${colors.cyan(query)[0]} to begin from.`
      }
    ])).num
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
  Logger.info('You have entered the', ...colors.cyan('configure menu'))
  Logger.info('You can run the following commands: ')
  console.log(`${tab}${colors.red('purge')[0]} ${tab} -- Delete configuration files`)
  console.log(`${tab}${colors.magenta('crawler')[0]} ${tab} -- Configure your crawler instance`)
  console.log(`${tab}${colors.red('exit')[0]} ${tab} -- Exit the configure menu`)

  console.log()
}
