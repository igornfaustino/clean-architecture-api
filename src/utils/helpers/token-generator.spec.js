jest.mock('jsonwebtoken', () => ({
  output: 'any_token',

  sign (value, secret) {
    this.value = value
    this.secret = secret
    return this.output
  }
}
))

const jwt = require('jsonwebtoken')
const { MissingParamError } = require('../errors')
const TokenGenerator = require('./token-generator')

const makeSut = () => {
  return new TokenGenerator('secret')
}

describe('Token Generator', () => {
  it('Should return null if JWT returns null', async () => {
    const sut = makeSut()
    jwt.output = null

    const token = await sut.generate('any_id')

    expect(token).toBeNull()
  })

  it('Should return a token if JWT returns a token', async () => {
    const sut = makeSut()

    const token = await sut.generate('any_id')

    expect(token).toBe(jwt.output)
  })

  it('Should call JWT with correct values', async () => {
    const sut = makeSut()

    await sut.generate('any_id')

    expect(jwt.value).toEqual({ value: 'any_id' })
    expect(jwt.secret).toBe(sut.secret)
  })

  it('should throw if no secret is provided', async () => {
    const sut = new TokenGenerator()

    const promise = sut.generate('any_value')

    await expect(promise).rejects.toThrow(new MissingParamError('secret'))
  })

  it('should throw if no value is provided', async () => {
    const sut = makeSut()

    const promise = sut.generate()

    await expect(promise).rejects.toThrow(new MissingParamError('value'))
  })
})
