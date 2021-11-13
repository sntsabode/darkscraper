import DarkSearch, { IDarkSearchResponseTuple } from '../darksearch'
import { ISaveDarkLinkResult } from '../models/darklink.model'
import { Maybe, waitFactory } from '../utils'
import Logger from '../utils/logger'

export default class Reconnaissance {
  #DarkSearches: DarkSearch[]
  #throttle: () => Promise<() => Promise<void>>

  constructor(
    baseQueries: string[],
    throttle: number = 10000
  ) {
    this.#DarkSearches = baseQueries.map(
      bq => new DarkSearch(bq)
    )

    this.#throttle = waitFactory(this.runSingleIteration, throttle)
  }

  #WORK = true
  runReconnaissance = async () => {
    while(this.#WORK) {
      await this.work()
    }
  }

  private work = async () => {
    console.time('_')
    const func = await this.#throttle()
    console.log('Throttle: ')
    console.timeEnd('_')
    return func()
  }

  runSingleIteration = async () => {
    const res = await this.runDarkSearches()

    const saveResults = await this.saveDarkSearchLinks(res)
    Logger.debug(saveResults)
  }

  private runDarkSearchesFactory = (
    func: 'searchBubbleError' | 'searchDebouncedBubbleError'
  ): () => Promise<Maybe<IDarkSearchResponseTuple[]>[]> =>
    async () => Promise.all(this.#DarkSearches.map(
      ds => ds[func]()
    ))

  runDarkSearches = this.runDarkSearchesFactory('searchBubbleError')
  runDarkSearchesDebounced = this.runDarkSearchesFactory('searchDebouncedBubbleError')

  saveDarkSearchLinks = async (
    res: Maybe<IDarkSearchResponseTuple[]>[]
  ): Promise<Maybe<ISaveDarkLinkResult[]>[]> => Promise.all(
    res.map(
      (res) => !!res
        ? Promise.all(res.map(([,saveLink]) => saveLink()))
        : res
    )
  )
}
