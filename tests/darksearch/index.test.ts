/*
yarn run mocha -r ts-node/register tests/darksearch/index.test.ts --timeout 900000
*/

import { assert } from 'chai'
import DarkSearch from '../../src/darksearch'

describe('DarkSearch test suite', () => {
  it('Should call the search method', async () => {
    const ds = new DarkSearch('hacker tutorial')
    assert(ds.getPage === 1, 'Page counter error before')

    await ds.search()

    assert(ds.getPage === 2, 'Page counter error after')
  })
})
