const { InvalidParamError, MissingParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeSut = () => {
  class LoadUserByEmailRepositorySpy {
    output = null

    async load (email) {
      this.email = email
      return this.output
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepositorySpy()
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy)
  return {
    sut,
    loadUserByEmailRepositorySpy
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

    await expect(promise).rejects.toThrow(new MissingParamError('loadUserByEmailRepository'))
  })

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const sut = new AuthUseCase({})

    const promise = sut.auth('any@mail.com', 'any_password')

    await expect(promise).rejects.toThrow(new InvalidParamError('loadUserByEmailRepository'))
  })

  test('Should return null if LoadUserByEmailRepository returns null', async () => {
    const { loadUserByEmailRepositorySpy, sut } = makeSut()
    loadUserByEmailRepositorySpy.output = null

    const accessToken = await sut.auth('invalid@mail.com', 'any_password')

    expect(accessToken).toBeNull()
  })
})
