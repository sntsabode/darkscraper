/*
yarn run mocha -r ts-node/register tests/models/darklink.model.test.ts --timeout 900000
*/

import { assert } from 'chai'
import * as darkLinkModel from '../../src/models/darklink.model'
import * as mongoUtils from '../../src/utils/mongoose'

describe('darklink model test suite', () => {
  before(async () => mongoUtils.connectMongo())

  it('Should call the saveDarkLink function with a new domain', async () => {
    const link = 'http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion'

    const { newLink } = await darkLinkModel.saveDarkLink(link, {
      path: '/',
      title: 'Demo Dark Link'
    })

    assert(newLink === true)
  })

  it('Should call the saveDarkLink function with an existing domain but a new path', async () => {
    const link = 'http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion'

    const { newLink, newPath } = await darkLinkModel.saveDarkLink(link, {
      path: '/path_2',
      title: 'Demo Dark Link 2'
    })

    assert(newLink === false)
    assert(newPath === true)
  })

  it('Should call the saveDarkLink function with an existing link and existing path', async () => {
    const link = 'http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion'

    const { newLink, newPath } = await darkLinkModel.saveDarkLink(link, {
      path: '/path_2',
      title: 'Demo Dark Link 2'
    })

    assert(newLink === false)
    assert(newPath === false)
  })

  it('Should call the saved dark links from the database', async () => {
    const domain = 'http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion'

    const darkLinks = await darkLinkModel.fetchDarkLinks()
    assert(darkLinks.length === 1)

    const [darkLink] = darkLinks
    assert(darkLink!.domain === domain)
    assert(darkLink!.paths.length === 2)

    const [path1, path2] = darkLink!.paths

    assert(path1!.path === '/', 'Path 1 path error')
    assert(path1!.title === 'Demo Dark Link', 'Path 1 title error')

    assert(path2!.path === '/path_2', 'Path 2 path error')
    assert(path2!.title === 'Demo Dark Link 2', 'Path 2 title error')
  })

  after(async () => mongoUtils.dropDatabase()
    .then(() => mongoUtils.disconnectMongo())
  )
})
