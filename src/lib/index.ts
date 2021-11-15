import Core, { ICoreConfiguration } from './core'
import Logger, { LogLevel } from './utils/logger'

export default async function crawler(
  coreConfig: ICoreConfiguration,
  ll: LogLevel
) {
  const core = new Core(coreConfig)
  await core.setup(ll)

  Logger.info('Running crawler')

  return core.runPerpetual()
}

