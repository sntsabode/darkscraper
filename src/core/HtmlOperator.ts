import * as cheerio from 'cheerio'

export default class HtmlOperator {
  static parseHtml(html: string): cheerio.CheerioAPI {
    const $ = cheerio.load(html)

    return $
  }

  static getAllLinks($: cheerio.CheerioAPI): string[] {
    const anchors = $('a')

    const links: string[] = []

    anchors.each((_i, anchor) => {
      const link = $(anchor).attr('href')
      if (link) { links.push(link) }
    })

    return links
  }
}
