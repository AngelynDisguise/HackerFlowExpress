import express, { Request, Response, Router } from 'express'
import DJ, { IDJ, IEvent } from '../../models/dj.js'

const router: Router = express.Router()

// Route to get all events  // todo: fix this atrocity. Make Event documents exportable and find() them directly
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