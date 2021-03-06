jest.mock('bcrypt', () => ({
  output: true,

  compare (value, hashedValue) {
    this.value = value
    this.hashedValue = hashedValue
    return this.output
  }
}))

const bcrypt = require('bcrypt')
const { MissingParamError } = require('../errors')
const Encrypter = require('./encrypter')

const makeSut = () => {
  return new Encrypter()
}

describe('Encrypter', () => {
  it('should return true if bcrypt returns true', async () => {
    const sut = makeSut()

    const isSame = await sut.compare('value', 'hashed_value')

    expect(isSame).toBe(true)
  })

  it('should return true if bcrypt returns true', async () => {
    const sut = makeSut()
    bcrypt.output = false

    const isSame = await sut.compare('value', 'hashed_value')

    expect(isSame).toBe(false)
  })

  it('should return calls bcrypt with right params', async () => {
    const sut = makeSut()

    await sut.compare('value', 'hashed_value')

    expect(bcrypt.value).toBe('value')
    expect(bcrypt.hashedValue).toBe('hashed_value')
  })

  it('should throw if no value is provided', async () => {
    const sut = makeSut()

    const promise = sut.compare()

    await expect(promise).rejects.toThrow(new MissingParamError('value'))
  })

  it('should throw if no hashedValue is provided', async () => {
    const sut = makeSut()

    const promise = sut.compare('any_value')

    await expect(promise).rejects.toThrow(new MissingParamError('hashedValue'))
  })
})
