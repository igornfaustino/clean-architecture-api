const { MissingParamError } = require('../../utils/errors')

module.exports = class UpdateAccessTokenRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async update (userId, accessToken) {
    if (userId === undefined) throw new MissingParamError('userId')
    if (accessToken === undefined) throw new MissingParamError('accessToken')
    this.userModel.updateOne({ _id: userId }, {
      $set: {
        accessToken
      }
    })
  }
}
