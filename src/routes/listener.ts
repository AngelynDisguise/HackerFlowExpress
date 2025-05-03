import express, { Response } from "express"
import axios from 'axios'
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

router.get('/listener', async (_, res: Response) => {
   try {
      const response1 = await axios.get('http://localhost:3000/api/djs')
      const djs_data = response1.data
      const response2 = await axios.get('http://localhost:3000/api/songs')
      const songs_data = response2.data

      res.render(path.join(__dirname, '..', 'views', 'listener', 'index.ejs'), {title: 'Listener', djs: djs_data, songs: songs_data})
   } catch (error) {
      console.error('(Listener) Error fetching DJs and Songs data:', error)
      res.status(500).send('Internal Server Error')
   }
   
})

export default router
