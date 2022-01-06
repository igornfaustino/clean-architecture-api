const { MongoClient } = require('mongodb')

module.exports = {
  async connect (uri) {
    this.client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    this.db = await this.client.db()
  },

  async disconnect () {
    await this.client.close()
  },

  async getCollection (name) {
    return this.db.collection(name)
  }
}
