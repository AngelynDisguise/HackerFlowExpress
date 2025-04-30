import express, { Response } from "express"
import path from 'path'
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

router.get('/dj', (_, res: Response) => {
   res.render(path.join(__dirname, '..', 'views', 'dj', 'index.ejs'))
})

router.get('/dj/search', (_, res: Response) => {
   res.render(path.join(__dirname, '..', 'views', 'dj', 'search.ejs'))
})

export default router
