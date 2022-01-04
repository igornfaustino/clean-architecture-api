module.exports = {
  output: true,

  compare (value, hashedValue) {
    this.value = value
    this.hashedValue = hashedValue
    return this.output
  }
}
