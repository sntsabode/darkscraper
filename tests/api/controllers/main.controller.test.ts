/*
yarn run mocha -r ts-node/register tests/api/controllers/main.controller.test.ts --timeout 900000
*/

import chai, { expect, assert } from 'chai'
import chaiHttp from 'chai-http'
import { app } from '../../../src/api/app'
import { connectMongo, disconnectMongo } from '../../../src/lib/utils/mongoose'

chai.use(chaiHttp)

const server = chai.request(app).keepOpen()

describe('main controller test suite', () => {
  before(async () => connectMongo())

  it('Should call the "/fetch-dark-links" route', async () => {
    const res = await server.get('/fetch-dark-links?limit=1000')
    expect(res).to.have.status(200)

    expect(res.body).to.have.property('links')

    assert.isArray(res.body.links)
    assert.isNotEmpty(res.body.links)
  })

  it('Should call the "/search-dark-links" route', async () => {
    const res = await server.get('/search-dark-links?search=onion&skip=1&limit=10')
    expect(res).to.have.status(200)

    expect(res.body).to.have.property('links')

    assert.isArray(res.body.links)
    assert.isNotEmpty(res.body.links)
  })

  after(async () => disconnectMongo()
    .then(() => server.close())
  )
})
