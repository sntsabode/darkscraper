import { HandleError } from '../utils'
import ErrorStack from '../utils/errorstack'
import Logger, { getLogLevel, LogLevels } from '../utils/logger'
import { connectMongo } from '../utils/mongoose'
import Infiltrator from './Infiltrator'
import Reconnaissance, { IBaseQueries } from './Reconnaissance'

export interface ICoreConfiguration {
  baseQueries: IBaseQueries
  panicTrigger: number
  reconThrottle: number
  infilThrottle: number
  infilWaitBeforeRunTime?: number
}

export default class Core extends HandleError {
  #Recon: Reconnaissance
  #Infil: Infiltrator

  constructor({
    baseQueries,
    reconThrottle,
    panicTrigger,
    infilThrottle
  }: ICoreConfiguration) {
    super()

    this.#Recon = new Reconnaissance(baseQueries, reconThrottle)
    this.#Infil = new Infiltrator(infilThrottle)
    ErrorStack.panicTrigger = panicTrigger
  }

  async setup(ll: LogLevels): Promise<void> {
    Logger.logLevel = getLogLevel(ll)

    await connectMongo()
    await this.#Infil.setup()
  }

  async runPerpetual() {
    return Promise.all([
      this.#Recon.runReconnaissance(),
      this.#Infil.runInfiltration()
    ])
  }
}
