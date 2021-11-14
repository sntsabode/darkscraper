#!/usr/bin/env node

import cli from './cli/index.cli'
import { panic } from './lib/utils'
import Logger from './lib/utils/logger'

cli().then(
  () => Logger.info('cli resolved'),
  (e) => panic(1, e.message)
)
