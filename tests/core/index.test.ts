/*
yarn run mocha -r ts-node/register tests/core/index.test.ts --timeout 900000
*/

import { assert } from 'chai'
import Core from '../../src/core'
import { connectMongo, disconnectMongo, dropDatabase } from '../../src/utils/mongoose'

describe('Core test suite', () => {
  const core = new Core(['bitcoin', 'ethereum', 'litecoin'])

  before(async () => connectMongo())

  it('Should call the runDarkSearches method', async () => {
    const res = await core.runDarkSearches()

    assert(res.length === 3)
  })

  it('Should call the saveDarkSearchLinks method', async () => {
    const res = await core.runDarkSearches()

    const saveRes = await core.saveDarkSearchLinks(res)

    assert(saveRes.length === 3)

    for (const i of saveRes) {
      assert(i!.length === 20)
    }
  })

  after(
    async () => dropDatabase()
      .then(() => disconnectMongo())
  )
})
