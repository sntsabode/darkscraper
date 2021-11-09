import { ISaveDarkLinkResult, saveDarkLink } from '../models/darklink.model'
import Requester, { IDarkSearchResponseBodyData } from '../requester'
import Logger from '../utils/logger'

type link = string
export type IDarkSearchResponse = [
  link,
  () => Promise<ISaveDarkLinkResult>
]

export default class DarkSearch {
  constructor(
    private query: string,
    private page = 1
  ) { }

  async searchBubbleError() {
    return this.search().catch(
      (e) => { Logger.debug(e); return undefined }
    )
  }

  async search(): Promise<IDarkSearchResponse[]> {
    Logger.debug(this.page)

    const res = await Requester.darkSearch(
      this.query,
      this.page
    )

    this.page++

    Logger.debug(res)

    return res.body.data.map(data => [
      data.link,
      this.saveLinkFactory(data)
    ])
  }

  private saveLinkFactory(
    data: IDarkSearchResponseBodyData
  ): () => Promise<ISaveDarkLinkResult> {
    const {
      protocol,
      hostname,
      pathname,
      search
    } = new URL(data.link)

    const domain = protocol + hostname
    const path = pathname + search

    Logger.debug(domain, path)

    return () => saveDarkLink(domain, {
      path,
      title: data.title
    })
  }

  get getPage(): number { return this.page }
}
