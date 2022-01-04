module.exports = {
  output: 'any_token',

  sign (value, secret) {
    this.value = value
    this.secret = secret
    return this.output
  }
}
