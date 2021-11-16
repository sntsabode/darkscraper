import { Request, Response } from 'express'
import { fetchDarkLinks as fetchDarkLinksFromDB } from '../../lib/models/darklink.model'
import Logger from '../../lib/utils/logger'

export async function fetchDarkLinks(
  req: Request,
  res: Response
) {
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
