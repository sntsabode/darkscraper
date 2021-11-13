import { HandleError } from '../utils'
import ErrorStack from '../utils/errorstack'
import Logger, { getLogLevel, LogLevels } from '../utils/logger'
import { connectMongo } from '../utils/mongoose'
import Infiltrator from './Infiltrator'
import Reconnaissance from './Reconnaissance'

export default class Core extends HandleError {
  #Recon: Reconnaissance
  #Infil: Infiltrator

  constructor(
    baseQueries: string[],
    panicTrigger = 10,
    reconThrottle = 1000
  ) {
    super()

    this.#Recon = new Reconnaissance(baseQueries, reconThrottle)
    this.#Infil = new Infiltrator()
    ErrorStack.panicTrigger = panicTrigger
  }

  async setup(ll: LogLevels): Promise<void> {
    Logger.logLevel = getLogLevel(ll)

    await connectMongo()
    await this.#Infil.setup()
  }

  async main() {

  }

  async runPerpetual() {
    return Promise.all([
      this.#Recon.runReconnaissance(),
      this.#Infil.runInfiltration()
    ])
  }
}
