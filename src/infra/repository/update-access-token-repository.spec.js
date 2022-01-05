const { MissingParamError } = require('../../utils/errors')
const mongoHelper = require('../helpers/mongo-helper')
const UpdateAccessTokenRepository = require('./update-access-token-repository')

let db

const makeSut = () => {
  const userModel = db.collection('users')
  const sut = new UpdateAccessTokenRepository(userModel)

  return { sut, userModel }
}

describe('Update AccessToken Repository', () => {
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

  it('Should update the user with the given accessToken', async () => {
    const { sut, userModel } = makeSut()
    const fakeUser = { email: 'valid_email@mail.com', password: 'any_password' }
    const { insertedId: fakeUserId } = await userModel.insertOne(fakeUser)

    await sut.update(fakeUserId, 'new_token')

    const updatedFakeUser = await userModel.findOne({ _id: fakeUserId })
    expect(updatedFakeUser.accessToken).toBe('new_token')
  })

  it('should throw if no userModel is provided', async () => {
    const userModel = db.collection('user')
    const fakeUser = { email: 'valid_email@mail.com', password: 'any_password' }
    const { insertedId: fakeUserId } = await userModel.insertOne(fakeUser)
    const sut = new UpdateAccessTokenRepository()

    const promise = sut.update(fakeUserId, 'any_token')

    await expect(promise).rejects.toThrow()
  })

  it('should throw if no params are provided', async () => {
    const userModel = db.collection('user')
    const fakeUser = { email: 'valid_email@mail.com', password: 'any_password' }
    const { insertedId: fakeUserId } = await userModel.insertOne(fakeUser)
    const sut = new UpdateAccessTokenRepository()

    await expect(sut.update(undefined, 'any_token')).rejects.toThrow(new MissingParamError('userId'))
    await expect(sut.update(fakeUserId)).rejects.toThrow(new MissingParamError('accessToken'))
  })
})
