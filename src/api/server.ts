require('dotenv').config()
import Logger from '../lib/utils/logger'
import { app } from './app'

export default async function server() {
  const PORT = <number>(process.env['PORT'] ?? 4200)

  app.listen(PORT, '0.0.0.0', () => {
    Logger.info(`Server listening on PORT ${PORT}`)
  })

  // Never resolve the promise
  return new Promise((_resolve) => { })
}
