const express = require('express')
const callsRouter = express.Router();
const { getAllCalls} = require('../db')

callsRouter.use((req,res,next)=>{
    console.log("A request is being made to /calls")
    next()
})


callsRouter.get('/', async (req,res) => {
    const calls = await getAllCalls()
    res.send({
        calls
    })
})

module.exports = callsRouter