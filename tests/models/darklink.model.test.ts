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
    assert(darkLinks.length === 1, 'Dark links length error')

    const [darkLink] = darkLinks
    assert(darkLink!.domain === domain, 'Domain error')
    assert(darkLink!.paths.length === 2, 'Paths length error')

    const [path1, path2] = darkLink!.paths

    assert(path1!.path === '/', 'Path 1 path error')
    assert(path1!.title === 'Demo Dark Link', 'Path 1 title error')

    assert(path2!.path === '/path_2', 'Path 2 path error')
    assert(path2!.title === 'Demo Dark Link 2', 'Path 2 title error')
  })

  it('Should call the updateDarkLinkPath function with an existing domain and path', async () => {
    const domain = 'http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion'
    const path = '/'

    let darkLink = await darkLinkModel.fetchDarkLink(domain)

    let [path1] = darkLink!.paths

    assert(path1!.blacklisted === undefined)

    await darkLinkModel.updateDarkLinkPath(
      { domain, path },
      'blacklisted',
      true
    )

    darkLink = await darkLinkModel.fetchDarkLink(domain)

    path1 = darkLink!.paths[0]!

    assert(path1.blacklisted, 'Should be blacklisted')
  })

  it('Should call the updateDarkLinkPath function with an existing domain but nonexistent path', async () => {
    const domain = 'http://doubletuoxp6ok2lgxvfrukbuo4gon3eb76tonsoa2kdo7njcb7xk7ad.onion'
    const path = '/dont_exist'

    await darkLinkModel.updateDarkLinkPath(
      { domain, path },
      'crawled',
      true
    )
  })

  it('Should call the updateDarkLinkPath function with a nonexistent domain and nonexistent path', async () => {
    const domain = 'http://i_dont_exist.onion'
    const path = '/dont_exist'

    await darkLinkModel.updateDarkLinkPath({ domain, path }, 'crawled', true)

    const res = await darkLinkModel.fetchDarkLinks()
    console.log(res)
  })

  after(async () => mongoUtils.dropDatabase()
    .then(() => mongoUtils.disconnectMongo())
  )
})
