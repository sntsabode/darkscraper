import Core from './core'
import Logger from './utils/logger'

const baseQueries = ['guide', 'hacker tutorial',]

export default async function crawler() {
  const core = new Core(baseQueries)

  await core.setup('debug')

  Logger.info('Running crawler')

  return core.runPerpetual()
}
