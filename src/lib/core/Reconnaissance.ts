import DarkSearch from '../darksearch'
import { ISaveDarkLinkResult, saveDarkLink } from '../models/darklink.model'
import { Maybe, waitFactory } from '../utils'
import Logger from '../utils/logger'

export interface IBaseQueries {
  [query: string]: number
}

export default class Reconnaissance {
  #DarkSearches: DarkSearch[] = []
  #throttle: number

  constructor(
    baseQueries: IBaseQueries,
    throttle: number = 10000
  ) {
    for (const [query, page] of Object.entries(baseQueries)) {
      this.#DarkSearches.push(new DarkSearch(query, page))
    }

    this.#throttle = throttle
  }

  #WORK = true
  runReconnaissance = async () => {
    while(this.#WORK) {
      await this.work()
    }
  }

  private work = async () => {
    const func = await waitFactory(
      this.runSingleIteration,
      this.#throttle
    )()

    return func()
  }

  runSingleIteration = async () => {
    const res = await this.runDarkSearches()

    const saveResults = await this.saveDarkSearchLinks(res)
    Logger.debug(saveResults)
  }

  runDarkSearches = async (): Promise<Maybe<string[]>[]> =>
    Promise.all(this.#DarkSearches.map(
      ds => ds.search()
    ))

  saveDarkSearchLinks = async (
    res: Maybe<string[]>[]
  ): Promise<Maybe<ISaveDarkLinkResult[]>[]> => Promise.all(
    res.map(
      (res) => !!res
        ? Promise.all(res.map((link) => saveDarkLink(link)))
        : res
    )
  )
}
