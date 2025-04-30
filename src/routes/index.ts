import express, { Response } from "express"

const router = express.Router()

// Define the home page route
router.get('/', function(_, res: Response) {
  res.render('index', { title: 'Home' })
})

export default router
