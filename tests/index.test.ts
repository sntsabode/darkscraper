process.env.NODE_ENV = 'test'

describe('darkscraper test suite', () => {
  require('./models/darklink.model.test')
  require('./requester/index.test')
  require('./darksearch/index.test')
  require('./core/index.test')
})
