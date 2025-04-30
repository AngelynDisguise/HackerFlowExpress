import express, { Request, Response } from "express"
import path from "path"
import fs from "fs"

import { DJData, EventData } from "../models/dj.js"
import { SongData } from "../models/song.js"
import { TimeslotData } from "../models/timeslot.js"

import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const readJSON = (filePath: fs.PathOrFileDescriptor) => {
   const rawData: string = fs.readFileSync(filePath, "utf-8")
   return JSON.parse(rawData)
}

const djs_data: DJData[] = readJSON(path.join(__dirname, '..', 'data', 'djs.json'))
const songs_data: SongData[] = readJSON(path.join(__dirname, '..', 'data', 'songs.json'))
const timeslots_data: TimeslotData = readJSON(path.join(__dirname, '..', 'data', 'timeslots.json'))
const events_data: EventData[] = readJSON(path.join(__dirname, '..', 'data', 'events.json'))

router.get('/api/djs', (_, res: Response) => {
   res.json(djs_data)
})

router.get('/api/songs', (_, res: Response) => {
   res.json(songs_data)
})

router.get('/api/timeslots', (_, res: Response) => {
   res.json(timeslots_data)
})

router.get('/api/events', (_, res: Response) => {
   res.json(events_data)
})


/* Upload data to events */
router.post('/api/events', (req: Request, res: Response) => {
   try {
      const newEvent: EventData = req.body

      // Generate a unique id for the new event, could be more sophisticated
      newEvent.eventID = events_data.length + 1

      events_data.push(newEvent)

      // Write the updated data to the events.json file
      fs.writeFile(path.join(__dirname, '..', 'data', 'events.json'), JSON.stringify(events_data, null, 2), (error) => {
         if (error) throw error
         return res.json({ message: 'Event added successfully!' })
      })
   } catch (error: unknown) {
      res.status(500).json({ message: errorMessage(error) })
   }
})

/* Upload data to djs */
router.post('/api/djs', (req: Request, res: Response) => {
   try {
      const updatedDJ = req.body;

      // Find the index of the DJ with the provided ID in our data
      const djIndex = djs_data.findIndex(dj => dj.djID === updatedDJ.djID)

      if (djIndex === -1) {
         res.status(404).json({ message: 'DJ not found.' })
         return
      }

      // Replace the existing DJ data with the updated one
      djs_data[djIndex] = updatedDJ

      // Save the updated DJs list back to djs.json
      fs.writeFile(path.join(__dirname, '..', 'data', 'djs.json'), JSON.stringify(djs_data, null, 2), (error) => {
         if (error) throw error
         res.json({ success: true, message: 'DJ updated successfully!' })
      })
   } catch (error: unknown) {
      res.status(500).json({ message: errorMessage(error) })
   }
})

function errorMessage(error: unknown): string {
   return error instanceof Error ? error.message : 'Unknown error occurred'
}

export default router
