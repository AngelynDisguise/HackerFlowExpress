import express, { Response } from "express"
import axios from 'axios'
import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()


router.get('/producer', (_, res: Response) => {
   res.render(path.join(__dirname, '..', 'views', 'producer', 'index.ejs'), {title: 'Producer Home'})
})

router.get('/producer/manage', async (_, res: Response) => {
   try {
      const response1 = await axios.get('http://localhost:3000/api/djs')
      const djs_data = response1.data
      const response2 = await axios.get('http://localhost:3000/api/songs')
      const songs_data = response2.data
      res.render(path.join(__dirname, '..', 'views', 'producer', 'manage.ejs'), {title: 'Manage', djs: djs_data, songs: songs_data})
   } catch (error) {
      console.error('Error fetching Songs data:', error)
      res.status(500).send('Internal Server Error')
   }
})

router.get('/producer/create', (_, res: Response) => {
   res.render(path.join(__dirname, '..', 'views', 'producer', 'create.ejs'), {title: 'Create'})
})

router.get('/producer/analytics', (_, res: Response) => {
   res.render(path.join(__dirname, '..', 'views', 'producer', 'analytics.ejs'), {title: 'My Analytics'})
})

router.get('/producer/discover', async (_, res: Response) => {
   try {
      const response = await axios.get('http://localhost:3000/api/djs')
      const djs_data = response.data;
      res.render(path.join(__dirname, '..', 'views', 'producer', 'discover.ejs'), {title: 'Discover Producers', djs: djs_data})
   } catch (error) {
      console.error('Error fetching DJ data:', error)
      res.status(500).send('Internal Server Error')
   }
})

export default router
