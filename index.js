const PORT = 3000
const express = require('express')
const server = express();
const apiRouter = require('./api')
server.use('/api',apiRouter)

const { client } = require('./db')
client.connect();

server.listen(PORT, () => {
    console.log('The server is up on port ', PORT)
})

server.use((req,res,next)=> {
    console.log("_____Body Logger START ____")
    console.log(req.body)
    console.log("____Body Logger END____")
})

