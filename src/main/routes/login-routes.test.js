const request = require('supertest')
const mongoHelper = require('../../infra/helpers/mongo-helper')
const app = require('../config/app')
const bcrypt = require('bcrypt')

describe('Login Routes', () => {
  let userModel

  beforeAll(async () => {
    await mongoHelper.connect(global.__MONGO_URI__)
    userModel = await mongoHelper.getCollection('users')
  })

  beforeEach(async () => {
    await userModel.deleteMany()
  })

  afterAll(async () => {
    await mongoHelper.disconnect()
  })

  it('should return 200 when valid credentials are provided', async () => {
    const password = 'any_password'
    const hashedPassword = bcrypt.hashSync(password, 10)
    const fakeUser = { email: 'valid_email@mail.com', password: hashedPassword }
    await userModel.insertOne(fakeUser)

    await request(app)
      .post('/api/login')
      .send({
        email: 'valid_email@mail.com',
        password: password
      })
      .expect(200)
  })
})
