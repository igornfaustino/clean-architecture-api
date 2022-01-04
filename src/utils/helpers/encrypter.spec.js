const bcrypt = require('bcrypt')
class Encrypter {
  async compare (password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword)
  }
}

describe('Encrypter', () => {
  it('should return true if bcrypt returns true', async () => {
    const sut = new Encrypter()

    const isSame = await sut.compare('any_password', 'hashed_password')

    expect(isSame).toBe(true)
  })

  it('should return true if bcrypt returns true', async () => {
    const sut = new Encrypter()
    bcrypt.output = false

    const isSame = await sut.compare('any_password', 'hashed_password')

    expect(isSame).toBe(false)
  })
})
