/*
yarn run mocha -r ts-node/register tests/core/Infiltrator.test.ts --timeout 900000
*/

import { assert } from 'chai'
import Infiltrator from '../../src/core/Infiltrator'
import { IDarkSearchResponseTuple } from '../../src/darksearch'
import { saveDarkLink } from '../../src/models/darklink.model'
import { connectMongo, disconnectMongo, dropDatabase } from '../../src/utils/mongoose'

const mockSaveFunc = async () => ({ newLink: false, newPath: true })
const linksToCall = [
  [
    [
      'http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion',
      mockSaveFunc
    ]
  ],
  undefined,
  undefined,
  [
    [
      'http://invest3y4iyeyghux5aubqevj6wqkfzwgg37aifhxx7fp7k7so4hinad.onion',
      mockSaveFunc
    ]
  ]
] as (IDarkSearchResponseTuple[] | undefined)[]

describe('Infiltrator test suite', () => {
  before(async () => {
    await connectMongo()

    return Promise.all([
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
    assert(links.length === 2)

    console.log(links)
  })

  after(async () => dropDatabase().then(() => disconnectMongo()))
})