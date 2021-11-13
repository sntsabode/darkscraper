import { parentPort } from 'worker_threads'
import crawler from '../../lib'

crawler().then(
  () => parentPort?.postMessage({ success: true }),
  error => parentPort?.postMessage({ error })
)
