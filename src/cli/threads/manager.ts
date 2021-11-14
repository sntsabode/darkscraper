import { Worker } from 'worker_threads'

export async function bootThread<T>(path: string, workerData: T) {
  const worker = new Worker(path, { workerData })

  return new Promise((resolve) => {
    worker.on('exit', (exitcode) => resolve(exitcode))
  })
}
