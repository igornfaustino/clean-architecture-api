const jwt = require('jsonwebtoken')
const { MissingParamError } = require('../errors')

module.exports = class TokenGenerator {
  constructor (secret) {
    this.secret = secret
  }

  async generate (value) {
    if (!this.secret) throw new MissingParamError('secret')
    if (!value) throw new MissingParamError('value')
    return jwt.sign(value, this.secret)
  }
}
