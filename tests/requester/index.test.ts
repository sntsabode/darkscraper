/*
yarn run mocha -r ts-node/register tests/requester/index.test.ts --timeout 900000
*/
import { assert } from 'chai'
import Requester from '../../src/requester'

describe('Requester instance test suite', () => {
  it('Should call the darkSearch Method', async () => {
    const res = await Requester.darkSearch('bitcoin', 1)
    assert.strictEqual(res.status, 200)

  })

  it('Should call the getOnion method', async () => {
    const res = await Requester.darkSearch('bitcoin', 1)
    const links = res.body.data

    let errorCount = 0

    for (const link of links) {
      const index = links.findIndex(val => val === link) + 1

      try {
        await Requester.getOnion(link.link)
        console.log(`getOnion ${index}/${links.length} ✅`)
      } catch (e) {
        console.log(e)
        console.log(`getOnion ${index}/${links.length} ❌`)
        errorCount++
      }
    }

    if (errorCount >= links.length - links.length / 2)
      throw new Error('getOnion failed')
  })
})
