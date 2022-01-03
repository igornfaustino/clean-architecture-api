module.exports = class ServerError extends Error {
  constructor () {
    super('internal error')
    this.name = 'ServerError'
  }
}
