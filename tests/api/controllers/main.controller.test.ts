/*
yarn run mocha -r ts-node/register tests/api/controllers/main.controller.test.ts --timeout 900000
*/

process.env.NODE_ENV = 'test'

import chai, { expect, assert } from 'chai'
import chaiHttp from 'chai-http'
import { app } from '../../../src/api/app'
import { saveDarkLink } from '../../../src/lib/models/darklink.model'
import Logger, { LogLevel } from '../../../src/lib/utils/logger'
import { connectMongo, disconnectMongo, dropDatabase } from '../../../src/lib/utils/mongoose'

Logger.logLevel = LogLevel['off']

chai.use(chaiHttp)

const server = chai.request(app).keepOpen()

describe('main controller test suite', () => {
  before(async () => connectMongo().then(
    () => Promise.all([
      saveDarkLink('http://darklink.onion'),
      saveDarkLink('http://darklink.onion/path10'),
      saveDarkLink('http://darklink2.onion'),
      saveDarkLink('http://darklink22.onion'),
      saveDarkLink('http://darklink22.onion/path2'),
      saveDarkLink('http://darklink1.onion'),
      saveDarkLink('http://darklink11.onion'),
      saveDarkLink('http://darklink11.onion/path11'),
      saveDarkLink('http://darklink100.onion'),
      saveDarkLink('http://darklink200.onion'),
      saveDarkLink('http://darklink67.onion'),
    ])
  ))

  it('Should call the "/fetch-dark-links" route', async () => {
    const res = await server.get('/fetch-dark-links?limit=1000')
    expect(res).to.have.status(200)

    expect(res.body).to.have.property('links')

    assert.isArray(res.body.links)
    assert.isNotEmpty(res.body.links)
  })

  it('Should call the "/search-dark-links" route', async () => {
    //const res =
    await server.get('/search-dark-links?search=onion&skip=1&limit=10')
    //expect(res).to.have.status(200)

    //expect(res.body).to.have.property('links')

    //assert.isArray(res.body.links)
    //assert.isNotEmpty(res.body.links)
  })

  after(async () => dropDatabase().then(() => disconnectMongo()
    .then(() => server.close()))
  )
})
