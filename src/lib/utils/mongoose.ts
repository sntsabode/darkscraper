import mongoose from 'mongoose'

const mongouri = 'mongodb://localhost:27017/'
const dbname = process.env.NODE_ENV !== 'test'
  ? 'darkscraper'
  : 'darkscraper_test_two'

export async function connectMongo(): Promise<typeof mongoose> {
  return mongoose.connect(`${mongouri}${dbname}`, {
    autoIndex: true
  })
}

export async function disconnectMongo(): Promise<void> {
  return mongoose.disconnect()
}

export async function dropDatabase(): Promise<boolean> {
  if (!mongouri.includes('localhost')) {
    throw new Error(
      '"Dropping database" is only allowed for local mongodb instances'
    )
  }

  return mongoose.connection.db.dropDatabase()
}
