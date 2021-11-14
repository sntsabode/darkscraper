import { fetchDarkLinks, ISaveDarkLinkResult, saveDarkLink, updateDarkLinkPath } from '../models/darklink.model'
import Requester, { IGetOnionResponse } from '../requester'
import { getDomainAndPath, isURL, Maybe } from '../utils'
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

  async setup() {
    this.#baseLinks = (await fetchDarkLinks(5)).map(
      link => link.domain + link.paths[0]?.path
    )

    Logger.debug<any>('Base links: ', this.#baseLinks)
  }

  async runInfiltration(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => this.runPerpetual().then(
        () => resolve()
      ), this.#waitBeforeRunTime)
    })
  }

  #work = true
  async runPerpetual(): Promise<void> {
    let links = await this.runSingleIteration()

    while (this.#work) {
      const [func, res] = await Promise.all([
        this.throttle(this.runSingleIteration),
        this.saveDarkLinks(links)
      ])

      Logger.debug<any>('Successfully acquired links, save results: ', res)

      links = await func(links)
    }
  }

  async runSingleIteration(baseLinks = this.#baseLinks): Promise<string[]> {
    const links: string[] = []
    const proms: (() => Promise<void>)[] = []

    for (const link of baseLinks) {
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

  async saveDarkLinks(links: string[]): Promise<Maybe<ISaveDarkLinkResult>[]> {
    return Promise.all(links.map(
      link => this.saveDarkLink(link)
    ))
  }

  async saveDarkLink(link: string): Promise<Maybe<ISaveDarkLinkResult>> {
    const isUrl = isURL(link)
    if (!isUrl) {
      return
    }

    return saveDarkLink(link)
  }

  async throttle<T extends Function>(cb: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(cb), this.#throttle)
    })
  }

  findLinksInResponseBody(res: IGetOnionResponse): string[] {
    try {
      return HtmlOperator.getAllLinks(HtmlOperator.parseHtml(res.body))
    } catch (e: any) {
      Logger.error('Error retrieving links from response body', e.message)
      return []
    }
  }

  findLinksInResponseBodies(
    resps: IGetOnionResponse[]
  ): string[] {
    const returnVal: string[] = []

    for (const res of resps) {
      returnVal.push(...this.findLinksInResponseBody(res))
    }

    return returnVal
  }

  async callDarkSearchResponseLink(
    param: string
  ): Promise<Maybe<IGetOnionResponse>> {
    const link = typeof param === 'string'
      ? param
      : param[0]

    const res = await Requester.getOnion(link)

    Logger.debug<any>(link, res)
    Logger.debug(Requester.GETOnionCount)

    return res
  }

  async callDarkSearchResponseLinks(
    res: Maybe<string[]>[]
  ): Promise<IGetOnionResponse[]> {
    // It's best these calls run sequentially. The function
    // used to call the onion links spawns a child process and
    // calls the link using "curl". This does not play well
    // with promises.

    const returnVal: IGetOnionResponse[] = []

    for (const i of res) {
      if (!i) continue

      for (const j of i) {
        const resp = await this.callDarkSearchResponseLink(j)
        if (resp) { returnVal.push(resp) }
      }
    }

    return returnVal
  }
}
