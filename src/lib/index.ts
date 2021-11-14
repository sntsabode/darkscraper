import Core, { ICoreConfiguration } from './core'
import Logger from './utils/logger'

export default async function crawler(coreConfig: ICoreConfiguration) {
  const core = new Core(coreConfig)

  await core.setup('debug')

  Logger.info('Running crawler')

  return core.runPerpetual()
}

