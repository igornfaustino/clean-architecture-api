const { MissingParamError } = require('../../utils/errors')
const MongoHelper = require('../helpers/mongo-helper')

module.exports = class UpdateAccessTokenRepository {
  async update (userId, accessToken) {
    if (userId === undefined) throw new MissingParamError('userId')
    if (accessToken === undefined) throw new MissingParamError('accessToken')
    const db = await MongoHelper.getDb()
    db.collection('users').updateOne({ _id: userId }, {
      $set: {
        accessToken
      }
    })
  }
}
