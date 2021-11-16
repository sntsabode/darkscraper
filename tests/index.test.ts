process.env.NODE_ENV = 'test'

describe('darkscraper test suite', () => {
  require('./lib/index.test')
  require('./api/index.test')
})
