const bcrypt = require('bcrypt')
const { MissingParamError } = require('../errors')

module.exports = class Encrypter {
  async compare (value, hashedValue) {
    if (!value) throw new MissingParamError('value')
    if (!hashedValue) throw new MissingParamError('hashedValue')
    return bcrypt.compare(value, hashedValue)
  }
}
