/*
yarn run mocha -r ts-node/register tests/core/Reconnaissance.test.ts --timeout 900000
*/

import { assert } from 'chai'
import Reconnaissance from '../../../src/lib/core/Reconnaissance'
import { connectMongo, disconnectMongo, dropDatabase } from '../../../src/lib/utils/mongoose'

describe('Reconnaissance test suite', () => {
  const recon = new Reconnaissance({ guide: 1, 'hacker tutorial': 10 })

  before(async () => connectMongo())

  it('Should call the runDarkSearches method', async () => {
    const res = await recon.runDarkSearches()

    assert(res.length === 3)
  })

  it('Should call the saveDarkSearchLinks method', async () => {
    const res = await recon.runDarkSearches()

    const saveRes = await recon.saveDarkSearchLinks(res)

    assert(saveRes.length === 3)

    for (const i of saveRes) {
      assert(i!.length === 20)
    }
  })

  it('Should call the runSingleIteration method', async () => {
    const res = await recon.runSingleIteration()
    console.log(res)
  })

  after(
    async () => dropDatabase()
      .then(() => disconnectMongo())
  )
})
