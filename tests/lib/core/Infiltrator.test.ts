/*
yarn run mocha -r ts-node/register tests/lib/core/Infiltrator.test.ts --timeout 900000
*/

process.env.NODE_ENV = 'test'

import { assert } from 'chai'
import Infiltrator from '../../../src/lib/core/Infiltrator'
import { saveDarkLink } from '../../../src/lib/models/darklink.model'
import { Maybe } from '../../../src/lib/utils'
import Logger, { LogLevel } from '../../../src/lib/utils/logger'
import { connectMongo, disconnectMongo, dropDatabase } from '../../../src/lib/utils/mongoose'

Logger.logLevel = LogLevel['off']

const linksToCall = [
  [
    'http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion',
  ],
  undefined,
  undefined,
  [
    'http://invest3y4iyeyghux5aubqevj6wqkfzwgg37aifhxx7fp7k7so4hinad.onion',
  ]
] as Maybe<string[]>[]

describe('Infiltrator test suite', () => {
  before(async () => {
    await connectMongo()

    await Promise.all([
      saveDarkLink('http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion', {
        path: '/',
        title: 'Demo Dark Link'
      }),

      saveDarkLink('http://invest5axdxwolqkn7mgpdxuzdspqrglrcfrn5fgmtck4iwvdxlttwid.onion', {
        path: '/',
        title: 'Demo Dark Link 2'
      })
    ])
  })

  it('Should call the verifyIsDarkLink method with a valid onion link', async () => {
    const infil = new Infiltrator()

    const v = await infil.verifyIsDarkLink('http://darklink.onion')
    assert.isTrue(v)
  })

  it('Should call the verifyIsDarkLink method with an invalid url', async () => {
    const infil = new Infiltrator()

    const v = await infil.verifyIsDarkLink('/signup')
    assert.isFalse(v)
  })

  it('Should call the verifyIsDarkLink method with a valid clear net url', async () => {
    const infil = new Infiltrator()

    const v = await infil.verifyIsDarkLink('https://www.google.co.za')
    assert.isFalse(v)
  })

  it('Should call the saveDarkLink method', async () => {
    const infil = new Infiltrator()

    //const res =
    await infil.saveDarkLink('http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion/path_2')

    //assert.isFalse(res!.newLink)
    //assert.isTrue(res!.newPath)
  })

  it('Should call the saveDarkLink method with an invalid url', async () => {
    const infil = new Infiltrator()

    const res = await infil.saveDarkLink('/signup')

    assert.isUndefined(res)
  })

  it('Should call the findLinksInResponseBodies method', async () => {
    const infil = new Infiltrator()

    const resps = await infil.callDarkSearchResponseLinks(linksToCall)

    for (const res of resps) {
      assert(res.headers.status === 200, 'Non status 200 response')
      assert(res.body !== '', 'Empty response body')
    }

    const links = infil.findLinksInResponseBodies(resps)

    const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/

    let errCount = 0

    for (const link of links) {
      try {
        assert(link.match(regex), `${link} failed regex test`)
      } catch (e: any) {
        errCount++
        console.error(e.message)
      }
    }

    if (errCount >= links.length / 2) {
      throw new Error('Links failed test')
    }
  })

  it('Should call the setup method', async () => {
    const infil = new Infiltrator()

    await infil.setup()

    const links = infil.baseLinks
    assert.isNotEmpty(links)
  })

  it('Should call the runSingleIteration method', async () => {
    const infil = new Infiltrator()
    await infil.setup()

    const links = await infil.runSingleIteration()
    assert.isNotEmpty(links)
  })

  after(async () => dropDatabase().then(() => disconnectMongo()))
})
