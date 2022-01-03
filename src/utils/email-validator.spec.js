const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

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
})
