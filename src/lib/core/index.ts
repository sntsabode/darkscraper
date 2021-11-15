import { HandleError } from '../utils'
import ErrorStack from '../utils/errorstack'
import Logger, { LogLevel } from '../utils/logger'
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
    infilThrottle,
    infilWaitBeforeRunTime
  }: ICoreConfiguration) {
    super()

    this.#Recon = new Reconnaissance(baseQueries, reconThrottle)
    this.#Infil = new Infiltrator(infilThrottle, infilWaitBeforeRunTime)
    ErrorStack.panicTrigger = panicTrigger
  }

  async setup(ll: LogLevel): Promise<void> {
    Logger.logLevel = ll

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
