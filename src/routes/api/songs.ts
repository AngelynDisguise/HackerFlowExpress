import express, { Response, Request, Router } from "express"
import Song, { ISong } from "../../models/song.js"

const router: Router = express.Router()

router.get('/songs', async (_, res: Response) => {
    try {
        const songs: ISong[] = await Song.find().exec()
        res.json(songs)
    } catch (error) {
        res.status(500).json({ message: errorMessage(error) })
    }
});

router.post('/songs/findByGenre', async (req: Request, res: Response) => {
    try {
        const genres: Record<string, boolean> = req.body;
        const genreQuery: Record<string, boolean> = {};

        Object.keys(genres).forEach(key => {
            if (genres[key]) {
                genreQuery[`genre.${key.toLowerCase()}`] = true
            }
        })

        const songsWithGenre: ISong[] = await Song.find(genreQuery).exec()
        console.log(songsWithGenre);

        res.json({ success: true, songs: songsWithGenre });
    } catch(error) {
        res.status(500).json({ message: errorMessage(error) })
    }
})

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error occurred'
}

export default router
