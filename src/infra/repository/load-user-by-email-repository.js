module.exports = class LoadUserByEmailRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async load (email) {
    return this.userModel.findOne({ email }, {
      projection: {
        password: 1
      }
    })
  }
}
