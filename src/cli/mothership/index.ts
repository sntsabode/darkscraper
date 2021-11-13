import argv from '../argv'
import { bootThread } from '../threads/manager'
import crawler from '../../lib'

export default async function main(argv: argv) {
  if (argv.purge) {
    await purgeDatabase()
  }

  if (argv.crawler && argv.server) {
    const processes: (() => Promise<number>)[] = []

    const pathToCrawlerEntryPoint = '../mothership/crawler.worker'
    processes.push(() => bootThread(pathToCrawlerEntryPoint))

    return Promise.all(processes.map(process => process()))
  } else if (argv.crawler) {
    return crawler()
  } else if (argv.server) {
    return
  }

  return
}

async function purgeDatabase() {

}
