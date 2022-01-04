const { MongoClient } = require('mongodb')

class LoadUserByEmailRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async load (email) {
    return this.userModel.findOne({ email })
  }
}

describe('LoadUserByEmailRepository', () => {
  let client
  let db

  beforeAll(async () => {
    client = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    db = await client.db()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await client.close()
  })

  it('return null if no user is found', async () => {
    const userModel = db.collection('users')
    const sut = new LoadUserByEmailRepository(userModel)

    const user = await sut.load('invalid_email@mail.com')

    expect(user).toBeNull()
  })

  it('return an user if user is found', async () => {
    const userModel = db.collection('users')
    await userModel.insertOne({ email: 'valid_email@mail.com' })
    const sut = new LoadUserByEmailRepository(userModel)

    const user = await sut.load('valid_email@mail.com')

    expect(user.email).toBe('valid_email@mail.com')
  })
})
