const { MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

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

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    output = {
      password: 'hashed_password'
    }

    async load (email) {
      this.email = email
      return this.output
    }
  }
  return new LoadUserByEmailRepositorySpy()
}

const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy)
  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy
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

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const sut = new AuthUseCase()

    const promise = sut.auth('any@mail.com', 'any_password')

    await expect(promise).rejects.toThrow()
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const sut = new AuthUseCase({})

    const promise = sut.auth('any@mail.com', 'any_password')

    await expect(promise).rejects.toThrow()
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
})
