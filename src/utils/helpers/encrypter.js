const bcrypt = require('bcrypt')

module.exports = class Encrypter {
  async compare (value, hashedValue) {
    return bcrypt.compare(value, hashedValue)
  }
}
