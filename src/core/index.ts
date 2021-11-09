import DarkSearch, { IDarkSearchResponse } from '../darksearch'
import { ISaveDarkLinkResult } from '../models/darklink.model'
import Requester from '../requester'
import ErrorStack from '../utils/errorstack'
import Logger from '../utils/logger'
import { connectMongo } from '../utils/mongoose'

export default class Core {
  #ErrorStack: ErrorStack
  #DarkSearches: DarkSearch[]

  constructor(
    baseQueries: string[],
    panicTrigger = 10
  ) {
    this.#ErrorStack = new ErrorStack(panicTrigger)

    this.#DarkSearches = baseQueries.map(
      bq => new DarkSearch(bq)
    )
  }

  async setup(): Promise<void> {
    return connectMongo() as unknown as Promise<void>
  }

  async main() {

  }

  #RUN = true
  async runPerpetual() {
    while (this.#RUN) {
      await this.runSingleIteration()
    }
  }

  private async runSingleIteration() {
    const res = await this.runDarkSearches()

    const [
      pageProcessingResults,
      saveResults
    ] = await Promise.all([
      this.callDarkSearchResponseLinks(res),
      this.saveDarkSearchLinks(res)
    ])

    Logger.debug(pageProcessingResults)
    Logger.debug(saveResults)
  }

  async runDarkSearches(): Promise<(IDarkSearchResponse[] | undefined)[]> {
    return Promise.all(this.#DarkSearches.map(
      ds => ds.searchBubbleError()
    ))
  }

  async callDarkSearchResponseLink([link]: IDarkSearchResponse) {
    const resp = await Requester.getOnion(link)
      .catch(e => this.handleError(e))

    if (!resp) return

    console.log(resp)


    //// Continue....

  }

  async callDarkSearchResponseLinks(
    res: (IDarkSearchResponse[] | undefined)[]
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

  async saveDarkSearchLinks(
    res: (IDarkSearchResponse[] | undefined)[]
  ): Promise<(ISaveDarkLinkResult[] | undefined)[]> {
    return Promise.all(
      res.map(
        (res) => !!res
          ? Promise.all(res.map(([,saveLink]) => saveLink()))
          : res
      )
    )
  }

  private handleError<E extends { message?: string }>(
    ...e: E[]
  ): void {
    Logger.error(...e)
    this.#ErrorStack.addError()
  }
}
