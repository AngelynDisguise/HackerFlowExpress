import express, { Response, Router } from "express"
import Timeslot from "../../models/timeslot.js"

const router: Router = express.Router()

router.get('/timeslots', async (_, res: Response) => {
    try {
        const timeslots = await Timeslot.find().exec()
        res.json(timeslots)
    } catch (error) {
        res.status(500).json({ message: errorMessage(error) })
    }
})

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error occurred'
}

export default router
