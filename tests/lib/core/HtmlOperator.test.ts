/*
yarn run mocha -r ts-node/register tests/lib/core/HtmlOperator.test.ts --timeout 900000
*/

process.env.NODE_ENV = 'test'

import { assert } from 'chai'
import HtmlOperator from '../../../src/lib/core/HtmlOperator'

const htmlLinks = [
  'http://nowhere.com/hello',
  'http://nowhere.com/hello-world',
  'http://nowhere.com/bye',
  'http://nowhere.com/bye-world'
]

const html = `
<!DOCTYPE html>
  <body>
    <div>
      <a href="${htmlLinks[0]}"><p>Hello</p></a>
      <a href="${htmlLinks[1]}"><p>World</p></a>
    </div>
    <footer>
      <a href="${htmlLinks[2]}"><p>Bye</p></a>
      <a href="${htmlLinks[3]}"><p>World</p></a>
    </footer>
  </body>
</html>
`

describe('HtmlOperator test suite', () => {
  it('Should call the getAllLinks method', (done) => {
    const $ = HtmlOperator.parseHtml(html)

    const links = HtmlOperator.getAllLinks($)

    assert(links.length === 4, 'Links are not enough')
    assert(links[0] === htmlLinks[0], 'Link error')
    assert(links[1] === htmlLinks[1], 'Link error')
    assert(links[2] === htmlLinks[2], 'Link error')
    assert(links[3] === htmlLinks[3], 'Link error')

    done()
  })
})
