import { IDarkSearchResponseTuple } from '../darksearch'
import Requester from '../requester'
import { HandleError } from '../utils'
import ErrorStack from '../utils/errorstack'
import Logger, { getLogLevel, LogLevels } from '../utils/logger'
import { connectMongo } from '../utils/mongoose'
import Reconnaissance from './Reconnaissance'

export default class Core extends HandleError {
  #Recon: Reconnaissance

  constructor(
    baseQueries: string[],
    panicTrigger = 10,
    reconThrottle = 1000
  ) {
    super()

    this.#Recon = new Reconnaissance(baseQueries, reconThrottle)
    ErrorStack.panicTrigger = panicTrigger
  }

  async setup(ll: LogLevels): Promise<void> {
    Logger.logLevel = getLogLevel(ll)

    return connectMongo() as unknown as Promise<void>
  }

  async main() {

  }

  async runPerpetual() {
    return Promise.all([
      this.#Recon.runReconnaissance()
    ])
  }

  async callDarkSearchResponseLink([link]: IDarkSearchResponseTuple) {
    const res = await Requester.getOnion(link)
      .catch(e => this.handleError(e))

    if (!res) return

    Logger.debug<any>(res, res.headers)
    Logger.debug<number | string>(Requester.GETOnionCount, '\n')


    //// Continue....

  }

  async callDarkSearchResponseLinks(
    res: (IDarkSearchResponseTuple[] | undefined)[]
  ) {
    // It's best these calls run sequentially. The function
    // used to call the onion links spawns a child process and
    // calls the link using "curl". This does not play well
    // with promises.

    for (const i of res) {
      if (!i) continue

      for (const j of i) {
        await this.callDarkSearchResponseLink(j)
      }
    }
  }
}
