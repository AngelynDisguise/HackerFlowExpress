import fs from "fs"
import dotenv from "dotenv"
import mongoose from "mongoose"

import DJModel, { DJ } from "./models/dj.js"
import SongModel, { Song } from "./models/song.js"
import TimeslotModel, { Timeslot } from "./models/timeslot.js"

dotenv.config()

const DJs: DJ[] = JSON.parse(fs.readFileSync('./src/data/djs.json', 'utf-8'))
const Songs: Song[] = JSON.parse(fs.readFileSync('./src/data/songs.json', 'utf-8'))
const Timeslots: Timeslot[] = JSON.parse(fs.readFileSync('./src/data/timeslots.json', 'utf-8'))

async function seedDB() {
   try {
      console.log("Clearing existing data...")
      await Promise.all([
         DJModel.deleteMany({}), 
         SongModel.deleteMany({}),
         TimeslotModel.deleteMany({})
      ])
      console.log("Database cleared")

      await DJModel.insertMany(DJs)
      console.log(`${DJs.length} DJs imported`)
      
      await SongModel.insertMany(Songs)
      console.log(`${Songs.length} Songs imported`)
      
      await TimeslotModel.insertMany(Timeslots.map(slot => ({ slot })))
      console.log(`${Timeslots.length} Timeslots imported`)

      console.log("Database seeding completed successfully!")

   } catch (error: unknown) {
      console.error('Error seeding database:', (error as Error).message)
      throw error;
   }
}

async function run(mongoURI: string) {
   try {
      await mongoose.connect(mongoURI)
      console.log('Connected to MongoDB Atlas...')
   } catch (error: unknown) {
      console.error('Could not connect to MongoDB Atlas...', error as Error)
      throw error
   }

   await seedDB()
   console.log('Seeding complete!')
}

const username: string = process.env.MONGODB_USERNAME || ""
const password: string = process.env.MONGODB_PASSWORD || ""
const clusterID: string = process.env.MONGODB_CLUSTER_ID || ""
const mongoURI: string = `mongodb+srv://${username}:${password}@${clusterID}.mongodb.net/?retryWrites=true&w=majority`

run(mongoURI)
   .then(() => {
      mongoose.connection.close()
      console.log('Database connection closed.')
      process.exit(0)
   })
   .catch((error: unknown) => {
      console.error(`Database seeding error: ${error as Error}\n Shutting down gracefully...`)
      mongoose.connection.close()
      process.exit(1)
   })