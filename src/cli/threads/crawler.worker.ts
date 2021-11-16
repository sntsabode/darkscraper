import { parentPort, workerData } from 'worker_threads'
import crawler from '../../lib'
import colors from '../../lib/utils/colors'
import Logger from '../../lib/utils/logger'

Logger.logLevel = workerData.logLevel

const tag = colors.yellow('[worker]')[0]

Logger.debug<any>(tag, 'Core configuration', workerData.coreConfig)
Logger.debug<any>(tag, 'Log level')

crawler(
  workerData.coreConfig,
  workerData.logLevel
).then(
  () => parentPort?.postMessage({ success: true }),
  error => parentPort?.postMessage({ error })
)
