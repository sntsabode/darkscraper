import { IncomingMessage } from 'http'
import https from 'https'
import debounce from 'lodash.debounce'
const TorFetch = require('torfetch')

export interface IDarkSearchResponseBodyData {
  title: string
  link: string
  description: string
}

export interface IDarkSearchResponseBody {
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
  data: IDarkSearchResponseBodyData[]
}

export interface IDarkSearchResponse {
  status?: number
  body: IDarkSearchResponseBody | string
}

export interface IResponse<T> {
  status?: number
  body: T | string
}

export interface IHeaders {
  server?: string
  date: Date
  'content-type': string
  'content-length': string
  'last-modified'?: Date
  connection?: string
  etag?: string
  'accept-ranges'?: string
  status: number
}

export interface IGetOnionResponse {
  headers: IHeaders
  body: string
}

export default class Requester {
  private constructor() { }

  private static PROXY = 'socks5://127.0.0.1:9050'
  static set proxy(proxy: string) { this.PROXY = proxy }
  static get proxy(): string { return this.PROXY }

  private static GET_ONION_COUNT = 0
  static get GETOnionCount(): number { return this.GET_ONION_COUNT }

  static async getOnion(endpoint: string): Promise<IGetOnionResponse> {
    return new Promise((resolve, reject) => {
      this.GET_ONION_COUNT++

      const req: IncomingMessage = new TorFetch(endpoint, { method: 'get' })

      let headers: IHeaders
      let body: string[] = []

      req.on('headers', (h) => {
        headers = h
      })

      req.on('data', (chunk) => { body.push(chunk) })
      req.on('end', () => resolve({ headers, body: body.join('') }))
      req.on('error', err => reject(err))
    })
  }

  static darkSearch(query: string, page: number): Promise<IDarkSearchResponse> {
    return new Promise<IDarkSearchResponse>((resolve, reject) => {
      https.get(`https://darksearch.io/api/search?query=${query}&page=${page}`, res => {
        res.setEncoding('utf-8')

        const body: string[] = []

        res.on('data', (chunk) => { body.push(chunk) })
        res.on('end', () => resolve({
          status: res.statusCode,
          body: this.attemptBodyParse(body)
        }))
        res.on('error', err => reject(err))
      }).on('error', (err) => reject(err))
    })
  }

  static get<T>(
    url: string,
    options: https.RequestOptions = { }
  ): Promise<IResponse<T>> {
    return new Promise((resolve, reject) => {
      https.get(url, options as https.RequestOptions, (res) => {
        res.setEncoding('utf-8')

        const body: string[] = []

        res.on('data', (chunk) => body.push(chunk))
        res.on('error', (err) => reject(err))
        res.on('end', () => resolve({
          status: res.statusCode,
          body: this.attemptBodyParse(body)
        }))
      }).on('error', (err) => reject(err))
    })
  }

  private static attemptBodyParse<T>(body: string[]): string | T {
    try {
      return JSON.parse(body.join(''))
    } catch (e) {
      return body.join('')
    }
  }

  static darkSearchDebounced = this.darkSearchDebouncedFactory()

  private static darkSearchDebouncedFactory() {
    return debounce(this.darkSearch, 2000)
  }
}
