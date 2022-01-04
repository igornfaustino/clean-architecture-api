const validator = require('validator')
const EmailValidator = require('./email-validator')
const { MissingParamError } = require('../errors')

const makeSut = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  it('Should return true if validator returns true', () => {
    const sut = makeSut()

    const isEmailValid = sut.isValid('valid@mail.com')

    expect(isEmailValid).toBe(true)
  })

  it('Should return false if validator returns false', () => {
    const sut = makeSut()
    validator.isEmailValid = false

    const isEmailValid = sut.isValid('invalid@mail.com')

    expect(isEmailValid).toBe(false)
  })

  it('Should call validator with correct email', () => {
    const sut = makeSut()

    sut.isValid('any@mail.com')

    expect(validator.email).toBe('any@mail.com')
  })

  it('should throw if no email is provided', async () => {
    const sut = makeSut()

    expect(sut.isValid).toThrow(new MissingParamError('email'))
  })
})
