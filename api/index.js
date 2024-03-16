const express = require('express')
const apiRouter = express.Router()

const callsRouter = require('./calls')
apiRouter.use('/calls', callsRouter)

module.exports = apiRouter