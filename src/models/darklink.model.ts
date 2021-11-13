import { model, Schema } from 'mongoose'
import { getDomainAndPath, Maybe } from '../utils'
import Logger from '../utils/logger'

export interface IDarkLinkPath {
	path: string
	title: string
	blacklisted?: boolean
  crawled?: boolean
}

export interface IDarkLink {
  domain: string
  paths: IDarkLinkPath[]
}

const DarkLinkSchema = new Schema<IDarkLink>({
  domain: {
    type: String,
    required: true,
    unique: true
  },

  paths: [
    {
      path: {
        type: String,
        required: true
      },

      title: {
        type: String,
        default: 'darkscraper_darklink'
      },

      blacklisted: {
        type: Boolean,
        required: false
      },

      crawled: {
        type: Boolean,
        required: false
      }
    }
  ]
})

export interface IDarkLinkModel extends IDarkLink {
  _id: number | string
  __v?: number
}

const DarkLinkModel = model('DarkLink', DarkLinkSchema)

export interface ISaveDarkLinkResult {
  newLink: boolean
  newPath?: boolean
}

export async function updateDarkLinkPath<T extends keyof IDarkLinkPath>(
  { domain, path }: { domain: string, path: string },
  updateKey: T,
  update: IDarkLinkPath[T]
) {
  const key = `paths.$.${updateKey}`

  let res = await DarkLinkModel.updateOne({
    domain, 'paths.path': path
  }, {
    $set: { [key]: update }
  })

  if (res.modifiedCount > 0) {
    Logger.debug(
      `Updated existing domain and path:\n`,
      `Domain: ${domain}`,
      `| Path: ${path}`,
      `| Update: { ${updateKey}: ${update} }`
    )

    return
  }

  res = await DarkLinkModel.updateOne(
    { domain, 'paths.path': { '$ne': path } },
    { $push: { paths: { path } } },
  )

  if (res.modifiedCount > 0) {
    Logger.debug(
      `Updated existing domain new path:\n`,
      `Domain: ${domain}`,
      `| Path: ${path}`,
      `| Update: { ${updateKey}: ${update} }`
    )

    return
  }

  await saveDarkLink(domain, { path })

  Logger.debug(
    `Added new domain and new path:\n`,
    `Domain: ${domain}`,
    `| Path: ${path}`,
    `| Update: { ${updateKey}: ${update} }`
  )
}

export async function saveDarkLink (
  linkOrDomain: string,
  path?: Partial<IDarkLinkPath>
): Promise<ISaveDarkLinkResult> {
  if (path) { return saveDarkLinkMain(linkOrDomain, path) }

  const { domain, path: pathName } = getDomainAndPath(linkOrDomain)

  return saveDarkLinkMain(domain, {
    path: pathName,
    title: 'Infiltrator result'
  })
}

async function saveDarkLinkMain(
  domain: string,
  path: Partial<IDarkLinkPath>
): Promise<ISaveDarkLinkResult> {
  const darkLink = new DarkLinkModel({
    domain,
    paths: [path]
  })

  return darkLink.save().then(
    () => ({ newLink: true }),
    async e => {
      if (e.code !== 11000) {
        throw e
      }

      return DarkLinkModel.updateOne(
        { domain, 'paths.path': { '$ne': path.path } },
        { $push: { paths: path } },
      ).then(
        (res) => {
          return ({
            newLink: false,
            newPath: !!res.modifiedCount
          })
        },
        e => { throw e }
      )
    }
  )
}

export async function fetchDarkLink(domain: string): Promise<Maybe<IDarkLinkModel>> {
  return DarkLinkModel.findOne({ domain })
}

export async function fetchDarkLinks(limit = 1000): Promise<IDarkLinkModel[]> {
  return DarkLinkModel.find({ }).limit(limit)
}
