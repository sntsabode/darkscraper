import { Request, Response } from 'express'
import {
  fetchDarkLinks as fetchDarkLinksFromDB,
  searchDarkLinks as searchDarkLinksInDB
} from '../../lib/models/darklink.model'
import Logger from '../../lib/utils/logger'

interface ISearchDarkLinksQuery {
  search: string
  skip?: string
  limit?: string
}

export async function searchDarkLinks(
  req: Request,
  res: Response
): Promise<Response> {
  if (!req.query.search) {
    return res.status(400).send({
      links: null,
      error: 'Please provide a search'
    })
  }

  const query
    = req.query as unknown as ISearchDarkLinksQuery

  try {
    return res.status(200).send({
      links: await searchDarkLinksInDB(
        query.search,
        !!query.skip
          ? parseInt(query.skip)
          : 0,
        !!query.limit
          ? parseInt(query.limit)
          : 25
      )
    })
  } catch (e: any) {
    console.log(e)

    const error = e.message
      ?? 'An unexpected error occurred searching for the dark links.'

    return res.status(500).send({ link: null, error })
  }
}

export async function fetchDarkLinks(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    return res.status(200).send({
      links: await fetchDarkLinksFromDB(
        req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined
      )
    })
  } catch (e: any) {
    const error = e.message
      ?? 'An unexpected error occurred while fetching all links'

    Logger.error(error)
    return res.status(500).send({ links: null, error })
  }
}
