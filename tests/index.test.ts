process.env.NODE_ENV = 'test'

describe('darkscraper test suite', () => {
  require('./lib/models/darklink.model.test')
  require('./lib/requester/index.test')
  require('./lib/darksearch/index.test')
  require('./lib/core/Reconnaissance.test')
  require('./lib/core/HtmlOperator.test')
  require('./lib/core/Infiltrator.test')
})
