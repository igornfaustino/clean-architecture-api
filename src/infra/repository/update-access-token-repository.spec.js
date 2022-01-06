const { MissingParamError } = require('../../utils/errors')
const mongoHelper = require('../helpers/mongo-helper')
const UpdateAccessTokenRepository = require('./update-access-token-repository')

let userModel

const makeSut = () => {
  const sut = new UpdateAccessTokenRepository()

  return { sut }
}

describe('Update AccessToken Repository', () => {
  let fakeUserId

  beforeAll(async () => {
    await mongoHelper.connect(global.__MONGO_URI__)
    userModel = await mongoHelper.getCollection('users')
  })

  beforeEach(async () => {
    await userModel.deleteMany()
    const fakeUser = { email: 'valid_email@mail.com', password: 'any_password' }
    const { insertedId } = await userModel.insertOne(fakeUser)
    fakeUserId = insertedId
  })

  afterAll(async () => {
    await mongoHelper.disconnect()
  })

  it('Should update the user with the given accessToken', async () => {
    const { sut } = makeSut()

    await sut.update(fakeUserId, 'new_token')

    const updatedFakeUser = await userModel.findOne({ _id: fakeUserId })
    expect(updatedFakeUser.accessToken).toBe('new_token')
  })

  it('should throw if no params are provided', async () => {
    const sut = new UpdateAccessTokenRepository()

    await expect(sut.update(undefined, 'any_token')).rejects.toThrow(new MissingParamError('userId'))
    await expect(sut.update(fakeUserId)).rejects.toThrow(new MissingParamError('accessToken'))
  })
})
