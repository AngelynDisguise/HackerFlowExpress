import express, { Request, Response, Router } from 'express'
import DJ, { IDJ, IEvent } from '../../models/dj.js'

const router: Router = express.Router()  //used to be: const router: Router = express.Router()

router.get('/djs', async (_, res: Response) => {
    try {
        const djs: IDJ[] = await DJ.find().exec() // ts wants a true promise :/
        res.json(djs)
    } catch (error: unknown) {
        res.status(500).json({ message: errorMessage(error) })
    }
})

// Route to add song to dj
router.post('/djs/:djID/addsong', async (req: Request, res: Response) => {
    try {
        const djID: number  = parseInt(req.params.djID, 10)
        const { songID } = req.body as { songID: number }
        const dj: IDJ | null = await DJ.findOne({ djID: djID }).exec()

        if (!dj) {
            res.status(404).json({ success: false, message: "DJ not found" })
            return
        }

        if (!dj.songs.includes(songID)) {
            dj.songs.push(songID)
            await dj.save()
            res.json({ success: true, updatedDJ: dj })
        } else {
            res.json({ success: false, message: "Song already in playlist" })
        }
    } catch (error: unknown) {
        res.status(500).json({ message: errorMessage(error) })
    }
})

// Route to delete song from dj
router.delete('/djs/:djID/deletesong', async (req: Request, res: Response) => {
    try {
        const djID = parseInt(req.params.djID, 10)
        const { songID } = req.body as { songID: number }
        const dj: IDJ | null = await DJ.findOne({ djID: djID }).exec()

        if (!dj) {
            res.status(404).json({ success: false, message: "DJ not found" })
            return
        }

        dj.songs = dj.songs.filter(id => id !== songID)
        await dj.save()
        res.json({ success: true, updatedDJ: dj })
    } catch (error) {
        res.status(500).json({ message: errorMessage(error) })
    }
})

// Route to get all events
router.get('/events', async (_, res: Response) => {
    try {
        const djs: IDJ[] = await DJ.find().exec()
        let events: IEvent[] = []

        djs.forEach(dj => {
            if (dj.events && dj.events instanceof Array) {
                events = events.concat(dj.events)
            }
        });

        res.json(events)
    } catch (error) {
        res.status(500).json({ message: errorMessage(error) })
    }
})

// Route to add an event to a DJ
router.post('/djs/:djID/addevent', async (req: Request, res: Response) => {
    try {
        const djID = parseInt(req.params.djID, 10)
        const { time, songs } = req.body as { time: string, songs: string[] }
        const dj: IDJ | null = await DJ.findOne({ djID: djID }).exec()

        if (!dj) {
            res.status(404).json({ success: false, message: "DJ not found" })
            return
        }
        
        const newEvent = {
            dj: dj.name,
            time: time,
            songs: songs
        };

        dj.events.push(newEvent)
        await dj.save()
        res.json({ success: true, message: 'Event added successfully' })
    } catch (error) {
        res.status(500).json({ message: errorMessage(error) })
    }
});

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error occurred'
}

export default router
