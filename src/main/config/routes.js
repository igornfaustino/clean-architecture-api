const router = require('express').Router()
const fb = require('fast-glob')

module.exports = app => {
  fb.sync('**/src/main/routes/**.js').forEach(file => {
    require(`../../../${file}`)(router)
  })
  app.use('/api', router)
}
