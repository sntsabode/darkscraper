import inquirer from 'inquirer'
import ms from './mothership'
import argv from './argv'
import colors from '../lib/utils/colors'

export default async function cli() {
  console.log(`\n${Title}\n`)

  const argv = await processArgs()

  return ms(argv)
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
  }

  if (!args.server && !args.crawler) {
    const answers = await askForServerCrawlerArgs()

    args.crawler = answers.crawler
    args.server = answers.server
  }

  return args
}

interface IInquirerQuestions {
  crawlerServerArgs: [string, string]
  purgeConfirmation: boolean
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
      choices: ['Crawler', 'Server'],
      default: ['Crawler']
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
