const mongoHelper = require('../helpers/mongo-helper')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')

let db

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new LoadUserByEmailRepository(userModel)

  return { sut, userModel }
}

describe('LoadUserByEmailRepository', () => {
  beforeAll(async () => {
    await mongoHelper.connect(global.__MONGO_URI__)
    db = await mongoHelper.getDb()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await mongoHelper.disconnect()
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

  it('should throw if no userModel is provided', () => {
    const sut = new LoadUserByEmailRepository()

    const promise = sut.load('any_email@mail.com')

    expect(promise).rejects.toThrow()
  })
})
