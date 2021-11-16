import Requester, { IDarkSearchResponse } from '../requester'
import { Maybe } from '../utils'
import Logger from '../utils/logger'

export interface IDarkSearchHistory {
  [query: string]: number
}

export default class DarkSearch {
  constructor(
    private query: string,
    private page = 1
  ) { }

  search = this.searchFactory(Requester.darkSearch)
  searchBubbleError = this.searchBubbleErrorFactory(this.search)

  private searchBubbleErrorFactory(
    searchFunc: () => Promise<Maybe<string[]>>
  ): () => Promise<Maybe<string[]>> {
    return async () => searchFunc().catch(
      (e) => { Logger.debug(e); return undefined }
    )
  }

  private searchFactory(
    searchFunc: (
      query: string,
      page: number
    ) => Maybe<Promise<IDarkSearchResponse>>
  ): () => Promise<Maybe<string[]>> {
    return async () => {
      const res = await searchFunc(
        this.query,
        this.page
      )

      Logger.debug<any>('DarkSearchInstance', this.query, this.page, res)

      if (!res) return

      this.page++

      if (typeof res.body === 'string') return

      return res.body.data.map(data => data.link)
    }
  }

  get getPage(): number { return this.page }
  get getQuery(): string { return this.query }
}
