import { Worker } from 'worker_threads'

export async function bootThread(path: string): Promise<number> {
  const worker = new Worker('./dist/cli/threads/worker', {
    workerData: { path }
  })

  return new Promise((resolve) => {
    worker.on('exit', (exitcode) => resolve(exitcode))
  })
}
