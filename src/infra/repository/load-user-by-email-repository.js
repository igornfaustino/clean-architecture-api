const { MissingParamError } = require('../../utils/errors')
const MongoHelper = require('../helpers/mongo-helper')

module.exports = class LoadUserByEmailRepository {
  async load (email) {
    if (email === undefined) throw new MissingParamError('email')
    const db = await MongoHelper.getDb()
    return db.collection('users').findOne({ email }, {
      projection: {
        password: 1
      }
    })
  }
}
