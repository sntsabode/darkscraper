import { parentPort, workerData as coreConfiguration } from 'worker_threads'
import crawler from '../../lib'

console.log('Workder data', coreConfiguration)

crawler(coreConfiguration).then(
  () => parentPort?.postMessage({ success: true }),
  error => parentPort?.postMessage({ error })
)
