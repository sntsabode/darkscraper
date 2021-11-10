import { ISaveDarkLinkResult, saveDarkLink } from '../models/darklink.model'
import Requester, { IDarkSearchResponse, IDarkSearchResponseBodyData } from '../requester'
import { Maybe } from '../utils'
import Logger from '../utils/logger'

type link = string
export type IDarkSearchResponseTuple = [
  link,
  () => Promise<ISaveDarkLinkResult>
]

export default class DarkSearch {
  constructor(
    private query: string,
    private page = 1
  ) { }

  search = this.searchFactory(Requester.darkSearch)
  searchDebounced = this.searchFactory(Requester.darkSearchDebounced)

  searchBubbleError = this.searchBubbleErrorFactory(this.search)
  searchDebouncedBubbleError = this.searchBubbleErrorFactory(this.searchDebounced)

  private searchBubbleErrorFactory(
    searchFunc: () => Promise<Maybe<IDarkSearchResponseTuple[]>>
  ): () => Promise<Maybe<IDarkSearchResponseTuple[]>> {
    return async () => searchFunc().catch(
      (e) => { Logger.debug(e); return undefined }
    )
  }

  private searchFactory(
    searchFunc: (
      query: string,
      page: number
    ) => Maybe<Promise<IDarkSearchResponse>>
  ): () => Promise<Maybe<IDarkSearchResponseTuple[]>> {
    return async () => {
      const res = await searchFunc(
        this.query,
        this.page
      )

      Logger.debug<any>('DarkSearchInstance', this.query, this.page, res)

      if (!res) return

      this.page++

      return res.body.data.map(data => [
        data.link,
        this.saveLinkFactory(data)
      ])
    }
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
