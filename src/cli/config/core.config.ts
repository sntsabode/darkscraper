import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { configDir, coreConfigPath } from '.'
import { ICoreConfiguration } from '../../lib/core'
import { Maybe } from '../../lib/utils'
import colors from '../../lib/utils/colors'
import Logger from '../../lib/utils/logger'

export function fetchCoreConfigFile(): Maybe<ICoreConfiguration> {
  try {
    return JSON.parse(readFileSync(coreConfigPath).toString())
  } catch (e) {
    return { } as ICoreConfiguration
  }
}

export function saveCoreConfigFile(config: ICoreConfiguration): void {
  try {
    writeFileSync(coreConfigPath, JSON.stringify(config))
  } catch (e: any) {
    if (e.code !== 'ENOENT') { throw e }

    mkdirSync(configDir, { recursive: true })
    writeFileSync(coreConfigPath, JSON.stringify(config))
  }
}

export function validateCoreConfig(config: ICoreConfiguration): {
  validated: boolean
  reason?: string
} {
  const baseQueries = validateBaseQueries(config)
  if (!baseQueries) {
    Logger.error('Core configuration invalid. An empty base queries object was found.')
    Logger.error(`Run the ${colors.cyan('darkscraper')[0]} command with the ${colors.cyan('-q')[0]}` +
    ` flag to configure your base queries.`
    )
    return { validated: false, reason: 'Empty base queries object' }
  }

  return { validated: true }
}

function validateBaseQueries({ baseQueries }: ICoreConfiguration) {
  let i = 0

  for (const [] of Object.entries(baseQueries)) { i++ }

  return i > 0
}
