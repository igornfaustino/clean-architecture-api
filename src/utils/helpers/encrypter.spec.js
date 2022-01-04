class Encrypter {
  async compare (password, hashedPassword) {
    return true
  }
}

describe('Encrypter', () => {
  it('should return true if bcrypt returns true', async () => {
    const sut = new Encrypter()

    const isSame = await sut.compare('any_password', 'hashed_password')

    expect(isSame).toBe(true)
  })
})
