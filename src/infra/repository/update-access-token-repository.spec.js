const mongoHelper = require('../helpers/mongo-helper')
let db

class UpdateAccessTokenRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async update (userId, accessToken) {
    this.userModel.updateOne({ _id: userId }, {
      $set: {
        accessToken
      }
    })
  }
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
    const userModel = db.collection('user')
    const fakeUser = { email: 'valid_email@mail.com', password: 'any_password' }
    const { insertedId: fakeUserId } = await userModel.insertOne(fakeUser)
    const sut = new UpdateAccessTokenRepository(userModel)

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
})
