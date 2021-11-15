import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { configDir, coreConfigPath } from '.'
import { ICoreConfiguration } from '../../lib/core'
import { IBaseQueries } from '../../lib/core/Reconnaissance'
import { isObjectEmpty } from '../../lib/utils'
import colors from '../../lib/utils/colors'
import Logger from '../../lib/utils/logger'
import { prompt } from '../utils'

export function fetchCoreConfigFile(): ICoreConfiguration {
  try {
    return JSON.parse(readFileSync(coreConfigPath).toString())
  } catch (e) {
    return { } as ICoreConfiguration
  }
}

export async function saveCoreConfigFile(
  newConfig: ICoreConfiguration,
  askForPrecedence?: boolean
  ): Promise<void> {
  const oldConfig = fetchCoreConfigFile()

  const config: ICoreConfiguration = {
    ...newConfig,
    baseQueries: await constructNewBaseQueriesObject(
      oldConfig.baseQueries,
      newConfig.baseQueries,
      askForPrecedence
    )
  }

  try {
    writeFileSync(coreConfigPath, JSON.stringify(config))
  } catch (e: any) {
    if (e.code !== 'ENOENT') { throw e }

    mkdirSync(configDir, { recursive: true })
    writeFileSync(coreConfigPath, JSON.stringify(config))
  }
}

async function constructNewBaseQueriesObject(
  oldBaseQueries: IBaseQueries = { },
  newBaseQueries: IBaseQueries,
  askForPrecedence?: boolean
): Promise<IBaseQueries> {
  const queries: IBaseQueries = { ...oldBaseQueries }

  for (const [query, page] of Object.entries(newBaseQueries)) {
    if (oldBaseQueries.hasOwnProperty(query)) {
      if (oldBaseQueries[query] === page) { continue }

      const msg = `Base Queries Clash: ${colors.cyan(query)[0]} `
        + `Current Page: ${colors.yellow(oldBaseQueries[query])[0]} `
        + `New Page: ${colors.yellow(page)[0]}`

      if (!askForPrecedence) {
        Logger.error(msg)
        continue
      }

      queries[query] = await prompt('number', `${msg}\nPlease enter a page number`)
      continue
    }

    queries[query] = page
  }

  return queries
}

export function validateCoreConfig(config: ICoreConfiguration): {
  validated: boolean
  reason?: string
} {
  const isBaseQueriesEmpty = isObjectEmpty(config.baseQueries)
  if (isBaseQueriesEmpty) {
    Logger.error('Core configuration invalid. An empty base queries object was found.')
    Logger.error(`Run the ${colors.cyan('darkscraper')[0]} command with the ${colors.cyan('-q')[0]}` +
    ` flag to configure your base queries.`
    )
    return { validated: false, reason: 'Empty base queries object' }
  }

  return { validated: true }
}
