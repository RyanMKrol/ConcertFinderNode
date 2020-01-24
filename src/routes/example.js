import express from 'express'

var router = express.Router()

router.use('/', async (req, res, next) => {
  console.log("Using some custom middleware!")
  next()
})

router.get('/', async (req, res, next) => {
  res.send("Sending back some data")
})

export default router
