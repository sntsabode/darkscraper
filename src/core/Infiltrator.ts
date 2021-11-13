import { IDarkSearchResponseTuple } from '../darksearch'
import { fetchDarkLinks, saveDarkLink } from '../models/darklink.model'
import Requester, { IGetOnionResponse } from '../requester'
import { Maybe } from '../utils'
import Logger from '../utils/logger'
import HtmlOperator from './HtmlOperator'

export default class Infiltrator {
  #throttle: number
  #baseLinks: string[] = []

  get baseLinks(): string[] { return this.#baseLinks }

  constructor(throttle = 120000) {
    this.#throttle = throttle
  }

  async setup() {
    this.#baseLinks = (await fetchDarkLinks(5)).map(
      link => link.domain + link.paths[0]?.path
    )
  }

  async runInfiltration(wait = 240000): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(async () => {
        await this.runPerpetual()
        resolve()
      }, wait)
    })
  }

  async runPerpetual(links?: string[]): Promise<void> {
    if (!links) {
      links = this.#baseLinks
    } else {
      await Promise.all(links.map((link) => this.saveLink(link)))
    }

    const resps: IGetOnionResponse[] = []

    // It's best these calls run sequentially.
    for (const link of links) {
      const res = await this.callDarkSearchResponseLink(link)
      if (!res) continue

      resps.push(res)
    }

    return this.runPerpetual(this.findLinksInResponseBodies(resps))
  }

  async throttle<T extends Function>(cb: T): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(cb), this.#throttle)
    })
  }

  async saveLink(link: string) {
    const {
      protocol,
      hostname,
      pathname,
      search
    } = new URL(link)

    const domain = protocol + hostname
    const path = pathname + search

    return saveDarkLink(domain, {
      path,
      title: 'Infiltrator result'
    })
  }

  findLinksInResponseBodies(
    resps: IGetOnionResponse[]
  ): string[] {
    const returnVal: string[] = []

    for (const res of resps) {
      try {
        returnVal.push(...HtmlOperator.getAllLinks(
          HtmlOperator.parseHtml(res.body)
        ))
      } catch (e: any) {
        Logger.error('Error retrieving links from response body', e.message)
      }
    }

    return returnVal
  }

  async callDarkSearchResponseLink(
    param: IDarkSearchResponseTuple | string
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
    res: (IDarkSearchResponseTuple[] | undefined)[]
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
