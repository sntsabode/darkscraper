/*
yarn run mocha -r ts-node/register tests/lib/core/Reconnaissance.test.ts --timeout 900000
*/

process.env.NODE_ENV = 'test'

import Reconnaissance from '../../../src/lib/core/Reconnaissance'
import { connectMongo, disconnectMongo, dropDatabase } from '../../../src/lib/utils/mongoose'

describe('Reconnaissance test suite', () => {
  const recon = new Reconnaissance({ guide: 1, 'hacker tutorial': 10 })

  before(async () => connectMongo())

  it('Should call the runDarkSearches method', async () => {
    await recon.runDarkSearches()
  })

  it('Should call the saveDarkSearchLinks method', async () => {
    const res = await recon.runDarkSearches()

    await recon.saveDarkSearchLinks(res)
  })

  it('Should call the runSingleIteration method', async () => {
    await recon.runSingleIteration()
  })

  after(
    async () => dropDatabase()
      .then(() => disconnectMongo())
  )
})
