const { InvalidParamError, MissingParamError } = require('../../utils/errors')
const { UnauthorizedError, ServerError } = require('../errors')
const LoginRouter = require('./login-router')

jest.spyOn(console, 'error').mockImplementation()

const makeSut = () => {
  const emailValidatorSpy = makeEmailValidator()
  const authUseCaseSpy = makeAuthUseCase()
  const sut = new LoginRouter({ authUseCase: authUseCaseSpy, emailValidator: emailValidatorSpy })
  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    output = true
    isValid (email) {
      this.email = email
      return this.output
    }
  }

  return new EmailValidatorSpy()
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    output = true
    isValid (email) {
      throw new Error()
    }
  }

  return new EmailValidatorSpy()
}

const makeAuthUseCase = () => {
  class AuthUseCaseSpy {
    output = 'any_token'

    async auth (email, password) {
      this.email = email
      this.password = password
      return this.output
    }
  }
  return new AuthUseCaseSpy()
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth (email, password) {
      throw new Error()
    }
  }
  return new AuthUseCaseSpy()
}

describe('Login Router', () => {
  it('should return 400 if no email is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })

  it('should return 400 if no password is provided', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@email.com'
      }
    }

    const httpResponse = await sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  it('should return 500 if httpRequest is provided', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.route()

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should return 500 if httpRequest has no body', async () => {
    const { sut } = makeSut()
    const httpRequest = {}

    const httpResponse = await sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should call AuthUseCase with correct params', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    await sut.route(httpRequest)

    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  it('should return 401 when invalid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    authUseCaseSpy.output = null
    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'invalid_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError())
  })

  it('should return 200 when valid credentials are provided', async () => {
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'valid_email@mail.com',
        password: 'valid_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.output)
  })

  it('should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    emailValidatorSpy.output = false
    const httpRequest = {
      body: {
        email: 'invalid_email@email.com',
        password: 'any_password'
      }
    }

    const httpResponse = await sut.route(httpRequest)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  it('should call EmailValidator with correct email', async () => {
    const { sut, emailValidatorSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    await sut.route(httpRequest)

    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const authUseCase = makeAuthUseCase()
    const emailValidator = makeEmailValidator()
    const dependencies = { authUseCase, emailValidator: emailValidator }
    const suts = [
      new LoginRouter(),
      new LoginRouter({}),
      new LoginRouter({ ...dependencies, emailValidator: null }),
      new LoginRouter({ ...dependencies, emailValidator: invalid }),
      new LoginRouter({ ...dependencies, authUseCase: null }),
      new LoginRouter({ ...dependencies, authUseCase: invalid })
    ]
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest)

      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    }
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const authUseCase = makeAuthUseCase()
    const emailValidator = makeEmailValidator()
    const dependencies = { authUseCase, emailValidator: emailValidator }
    const suts = [
      new LoginRouter({ ...dependencies, emailValidator: makeEmailValidatorWithError() }),
      new LoginRouter({ ...dependencies, authUseCase: makeAuthUseCaseWithError() })
    ]
    const httpRequest = {
      body: {
        email: 'any_email@mail.com',
        password: 'any_password'
      }
    }

    for (const sut of suts) {
      const httpResponse = await sut.route(httpRequest)

      expect(httpResponse.statusCode).toBe(500)
      expect(httpResponse.body).toEqual(new ServerError())
    }
  })
})
