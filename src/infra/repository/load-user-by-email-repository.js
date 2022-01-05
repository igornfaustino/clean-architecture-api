const { MissingParamError } = require('../../utils/errors')

module.exports = class LoadUserByEmailRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async load (email) {
    if (email === undefined) throw new MissingParamError('email')
    return this.userModel.findOne({ email }, {
      projection: {
        password: 1
      }
    })
  }
}
