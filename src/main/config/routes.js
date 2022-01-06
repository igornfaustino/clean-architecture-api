const router = require('express').Router()
const fg = require('fast-glob')

module.exports = app => {
  fg.sync('**/src/main/routes/**.js').forEach(file => {
    require(`../../../${file}`)(router)
  })
  app.use('/api', router)
}
