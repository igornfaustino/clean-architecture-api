const bcrypt = require('bcrypt')
class Encrypter {
  async compare (value, hashedValue) {
    return bcrypt.compare(value, hashedValue)
  }
}

describe('Encrypter', () => {
  it('should return true if bcrypt returns true', async () => {
    const sut = new Encrypter()

    const isSame = await sut.compare('value', 'hashed_value')

    expect(isSame).toBe(true)
  })

  it('should return true if bcrypt returns true', async () => {
    const sut = new Encrypter()
    bcrypt.output = false

    const isSame = await sut.compare('value', 'hashed_value')

    expect(isSame).toBe(false)
  })

  it('should return calls bcrypt with right params', async () => {
    const sut = new Encrypter()

    await sut.compare('value', 'hashed_value')

    expect(bcrypt.value).toBe('value')
    expect(bcrypt.hashedValue).toBe('hashed_value')
  })
})
