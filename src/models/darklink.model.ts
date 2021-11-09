import { model, Schema } from 'mongoose'

export interface IDarkLinkPath {
	path: string
	title: string
	blacklisted?: boolean
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
        required: false,
        default: 'darkscraper_darklink'
      },

      blacklisted: {
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

export async function saveDarkLink(
  domain: string,
  path: IDarkLinkPath
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


export async function fetchDarkLinks(): Promise<IDarkLinkModel[]> {
  return DarkLinkModel.find({ })
}
