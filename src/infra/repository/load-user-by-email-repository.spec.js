const { MongoClient } = require('mongodb')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')

let client
let db

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new LoadUserByEmailRepository(userModel)

  return { sut, userModel }
}

describe('LoadUserByEmailRepository', () => {
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
    const { sut } = makeSut()
    const user = await sut.load('invalid_email@mail.com')

    expect(user).toBeNull()
  })

  it('return an user if user is found', async () => {
    const { sut, userModel } = makeSut()
    const fakeUser = { email: 'valid_email@mail.com', password: 'any_password' }
    const insertedUser = await userModel.insertOne(fakeUser)

    const user = await sut.load('valid_email@mail.com')

    expect(user).toEqual({
      _id: insertedUser.insertedId,
      password: fakeUser.password
    })
  })
})
