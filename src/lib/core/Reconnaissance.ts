import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import DarkSearch, { IDarkSearchHistory } from '../darksearch'
import { configDir, darkSearchHistoryPath } from '../dirs'
import { ISaveDarkLinkResult, saveDarkLink } from '../models/darklink.model'
import { Maybe, waitFactory } from '../utils'
import colors from '../utils/colors'
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
    for (const [query, page] of Object.entries(
      this.#contructBaseQueries(baseQueries)
    )) {
      this.#DarkSearches.push(new DarkSearch(query, page))
      Logger.info(`DarkSearch instance for ${query}, `
        + `starting at page ${page}`
      )
    }

    this.#throttle = throttle
  }

  #i = 1
  #work = true
  runReconnaissance = async () => {
    while(this.#work) {
      await this.work()

      Logger.info(`Reconnaissance interation ${this.#i} complete.`)
      this.#i++
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
    this.saveDarkSearchHistory()
    Logger.verbose(saveResults)
  }

  runDarkSearches = async (): Promise<Maybe<string[]>[]> =>
    Promise.all(this.#DarkSearches.map(
      ds => ds.search()
    ))

  saveDarkSearchHistory = () => {
    const history = this.fetchDarkSearchHistory()

    for (const ds of this.#DarkSearches) {
      history[ds.getQuery] = ds.getPage
    }

    try {
      writeFileSync(darkSearchHistoryPath, JSON.stringify(history))
    } catch (e: any) {
      this.#handleENOENTerror(e, history)
    }
  }

  fetchDarkSearchHistory = (): IDarkSearchHistory => {
    try {
      return JSON.parse(
        readFileSync(darkSearchHistoryPath).toString()
      )
    } catch (e: any) {
      return this.#handleENOENTerror(e)
    }
  }

  saveDarkSearchLinks = async (
    res: Maybe<string[]>[]
  ): Promise<Maybe<ISaveDarkLinkResult[]>[]> => Promise.all(
    res.map(
      (res) => !!res
        ? Promise.all(res.map((link) => saveDarkLink(link)))
        : res
    )
  )

  #contructBaseQueries = (baseQueries: IBaseQueries): IBaseQueries => {
    const history = this.fetchDarkSearchHistory()

    for (const [query, page] of Object.entries(baseQueries)) {
      if (history.hasOwnProperty(query)) {
        if (history[query]! > page) {
          Logger.error(`Entered page ${page} for `
            + `${colors.cyan(query)[0]} query, but history `
            + `is on page ${history[query]}. Giving precedence to history.`
          )

          continue
        } else {
          history[query] = page
          continue
        }
      }

      history[query] = page
    }

    return history
  }

  #handleENOENTerror = <T extends { code: string }>(
    e: T,
    history: IDarkSearchHistory = { }
  ): IDarkSearchHistory => {
    if (e.code !== 'ENOENT') { throw e }

    try {
      writeFileSync(darkSearchHistoryPath, JSON.stringify(history))
      return { }
    } catch (e: any) {
      if (e.code !== 'ENOENT') { throw e }

      mkdirSync(configDir)
      writeFileSync(darkSearchHistoryPath, JSON.stringify(history))
      return { }
    }
  }
}
