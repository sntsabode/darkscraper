import { fetchDarkLinks, ISaveDarkLinkResult, saveDarkLink, updateDarkLinkPath } from '../models/darklink.model'
import Requester, { IGetOnionResponse } from '../requester'
import { getDomainAndPath, isURL, Maybe } from '../utils'
import colors from '../utils/colors'
import Logger from '../utils/logger'
import HtmlOperator from './HtmlOperator'

export default class Infiltrator {
  #throttle: number
  #baseLinks: string[] = []
  #waitBeforeRunTime: number

  get baseLinks(): string[] { return this.#baseLinks }

  constructor(
    throttle = 120000,
    waitBeforeRunTime = 120000
  ) {
    this.#throttle = throttle
    this.#waitBeforeRunTime = waitBeforeRunTime
  }

  setup = async () => {
    this.#baseLinks = (await fetchDarkLinks(5)).map(
      link => link.domain + link.paths[0]?.path
    )

    Logger.debug<any>('Base links: ', this.#baseLinks)
  }

  runInfiltration = async (): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        Logger.info(`Running Infiltrator after ${this.#waitBeforeRunTime}ms of waiting.`)
        return this.runPerpetual().then(
          () => resolve()
        )
      }, this.#waitBeforeRunTime)
    })
  }

  #i = 1
  #work = true
  runPerpetual = async (): Promise<void> => {
    let links = await this.runSingleIteration()

    while (this.#work) {
      const [func, res] = await Promise.all([
        this.throttle(this.runSingleIteration),
        this.saveDarkLinks(links)
      ])

      Logger.verbose<any>('Successfully acquired links, save results: ', res)

      links = await func(links)

      Logger.info(`Infiltrator interation ${this.#i} complete.`)
      this.#i++
    }
  }

  runSingleIteration = async (baseLinks?: string[]): Promise<string[]> => {
    const links: string[] = []
    const proms: (() => Promise<void>)[] = []

    for (const link of baseLinks ?? this.#baseLinks) {
      const res = await this.callDarkSearchResponseLink(link)
      if (!res) continue

      proms.push(() => updateDarkLinkPath(
        getDomainAndPath(link),
        'crawled',
        true
      ))

      links.push(...this.findLinksInResponseBody(res))
    }

    Logger.debug<any>('Successfully crawled: ', baseLinks)
    Logger.debug<any>('Found', links)

    await Promise.all(proms.map((update) => update()))

    return links
  }

  saveDarkLinks = async (links: string[]): Promise<Maybe<ISaveDarkLinkResult>[]> => {
    return Promise.all(links.map(
      link => this.saveDarkLink(link)
    ))
  }

  saveDarkLink = async (link: string): Promise<Maybe<ISaveDarkLinkResult>> => {
    const isUrl = isURL(link)
    if (!isUrl) {
      return
    }

    return saveDarkLink(link)
  }

  throttle = async <T extends Function>(cb: T): Promise<T> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(cb), this.#throttle)
    })
  }

  findLinksInResponseBody = (res: IGetOnionResponse): string[] => {
    try {
      return HtmlOperator.getAllLinks(HtmlOperator.parseHtml(res.body))
    } catch (e: any) {
      Logger.error('Error retrieving links from response body', e.message)
      return []
    }
  }

  findLinksInResponseBodies = (
    resps: IGetOnionResponse[]
  ): string[] => {
    const returnVal: string[] = []

    for (const res of resps) {
      returnVal.push(...this.findLinksInResponseBody(res))
    }

    Logger.info(`Found ${returnVal.length} links during iteration ${this.#i}`)
    return returnVal
  }

  callDarkSearchResponseLink = async (
    link: string
  ): Promise<Maybe<IGetOnionResponse>> => {
    const res = await Requester.getOnion(link)
    const status = (res.headers ?? { }).status

    Logger.info(
      `Infiltrator call to ${colors.yellow(link)[0]} responded with `
      + `status: ${status === 200
          ? colors.green(status)[0]
          : colors.red(status)[0]
      }`
    )

    Logger.verbose<any>(link, res)
    Logger.verbose(Requester.GETOnionCount)

    return res
  }

  callDarkSearchResponseLinks = async(
    res: Maybe<string[]>[]
  ): Promise<IGetOnionResponse[]> => {
    // It's best these calls run sequentially. The function
    // used to call the onion links spawns a child process and
    // calls the link using "curl". This does not play well
    // with promises.

    const returnVal: IGetOnionResponse[] = []

    for (const i of res) {
      if (!i) continue

      for (const j of i) {
        const resp = await this.callDarkSearchResponseLink(j)
        if (!resp) { continue }

        returnVal.push(resp)
        Logger.info('Successfully called', j)
      }
    }

    return returnVal
  }
}
