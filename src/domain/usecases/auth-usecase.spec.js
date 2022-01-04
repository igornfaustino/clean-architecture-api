const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepositorySpy {
    update (userId, accessToken) {
      this.userId = userId
      this.accessToken = accessToken
    }
  }

  return new UpdateAccessTokenRepositorySpy()
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    output = 'any_token'

    generate (userId) {
      this.userId = userId
      return this.output
    }
  }
  return new TokenGeneratorSpy()
}

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    generate (userId) {
      throw new Error()
    }
  }
  return new TokenGeneratorSpy()
}

const makeEncrypter = () => {
  class EncrypterSpy {
    output = true
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.output
    }
  }
  return new EncrypterSpy()
}

const makeEncrypterWithError = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      throw new Error()
    }
  }
  return new EncrypterSpy()
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    output = {
      id: 'any_id',
      password: 'hashed_password'
    }

    async load (email) {
      this.email = email
      return this.output
    }
  }
  return new LoadUserByEmailRepositorySpy()
}

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load (email) {
      throw new Error()
    }
  }
  return new LoadUserByEmailRepositorySpy()
}

const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const tokenGeneratorSpy = makeTokenGenerator()
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepository()
  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy
  })
  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy,
    updateAccessTokenRepositorySpy
  }
}

describe('Auth UseCase', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSut()

    const promise = sut.auth()

    await expect(promise).rejects.toThrow(new MissingParamError('email'))
  })

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSut()

    const promise = sut.auth('any@mail.com')

    await expect(promise).rejects.toThrow(new MissingParamError('password'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { loadUserByEmailRepositorySpy, sut } = makeSut()

    await sut.auth('any@mail.com', 'any_password')

    expect(loadUserByEmailRepositorySpy.email).toBe('any@mail.com')
  })

  test('Should return null if an invalid email is provided', async () => {
    const { loadUserByEmailRepositorySpy, sut } = makeSut()
    loadUserByEmailRepositorySpy.output = null

    const accessToken = await sut.auth('invalid@mail.com', 'any_password')

    expect(accessToken).toBeNull()
  })

  test('Should return null if an invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.output = false

    const accessToken = await sut.auth('valid@mail.com', 'invalid_password')

    expect(accessToken).toBeNull()
  })

  test('Should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()

    await sut.auth('valid@mail.com', 'any_password')

    expect(encrypterSpy.password).toBe('any_password')
    expect(encrypterSpy.hashedPassword).toBe(loadUserByEmailRepositorySpy.output.password)
  })

  test('Should call TokenGenerator with correct userId', async () => {
    const { sut, tokenGeneratorSpy, loadUserByEmailRepositorySpy } = makeSut()

    await sut.auth('valid@mail.com', 'valid_password')

    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.output.id)
  })

  test('Should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()

    const accessToken = await sut.auth('valid@mail.com', 'valid_password')

    expect(accessToken).toBe(tokenGeneratorSpy.output)
    expect(accessToken).toBeTruthy()
  })

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, updateAccessTokenRepositorySpy, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()

    await sut.auth('valid@mail.com', 'valid_password')

    expect(updateAccessTokenRepositorySpy.userId).toBe(loadUserByEmailRepositorySpy.output.id)
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(tokenGeneratorSpy.output)
  })

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {}
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const tokenGenerator = makeTokenGenerator()
    const suts = [
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({ loadUserByEmailRepository: null, encrypter, tokenGenerator }),
      new AuthUseCase({ loadUserByEmailRepository: invalid, encrypter, tokenGenerator }),
      new AuthUseCase({ loadUserByEmailRepository, encrypter: null, tokenGenerator }),
      new AuthUseCase({ loadUserByEmailRepository, encrypter: invalid, tokenGenerator }),
      new AuthUseCase({ loadUserByEmailRepository, encrypter, tokenGenerator: null }),
      new AuthUseCase({ loadUserByEmailRepository, encrypter, tokenGenerator: invalid })
    ]

    for (const sut of suts) {
      const promise = sut.auth('any@mail.com', 'any_password')

      await expect(promise).rejects.toThrow()
    }
  })

  test('Should throw if any dependencies throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const tokenGenerator = makeTokenGenerator()
    const suts = [
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError(),
        encrypter,
        tokenGenerator
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: makeEncrypterWithError(),
        tokenGenerator
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: makeTokenGeneratorWithError()
      })
    ]

    for (const sut of suts) {
      const promise = sut.auth('any@mail.com', 'any_password')

      await expect(promise).rejects.toThrow()
    }
  })
})
