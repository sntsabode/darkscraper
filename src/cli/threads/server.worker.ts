import { parentPort } from 'worker_threads'
import server from '../../api/server'
import colors from '../../lib/utils/colors'
import Logger from '../../lib/utils/logger'

const tag = colors.yellow('[worker]')[0]

Logger.debug<any>(tag, 'Booting server')

server().then(
  () => parentPort?.postMessage({ success: true }),
  error => parentPort?.postMessage({ error })
)
