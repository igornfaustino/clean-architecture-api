class EmailValidator {
  isValid (email) {
    return true
  }
}

describe('Email Validator', () => {
  it('Should return true if validator returns true', () => {
    const sut = new EmailValidator()

    const isEmailValid = sut.isValid('valid@mail.com')

    expect(isEmailValid).toBeTruthy()
  })
})
