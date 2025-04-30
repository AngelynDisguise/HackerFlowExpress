import express, { Response, Application } from "express"
import { MongoClient, ChangeStream, ChangeStreamDocument } from "mongodb"
import { Server as SocketIOServer } from "socket.io"
import mongoose from "mongoose"
import path from "path"
import bodyParser from "body-parser"
import http from "http"
import dotenv from "dotenv"
import { fileURLToPath } from "url"

// Load enivronment var
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Routers
import indexRouter from './routes/index.js'
import listenerRouter from './routes/listener.js'
import producerRouter from './routes/producer.js'
import djRouter from './routes/dj.js'

import djRoutes from './routes/api/djs.js'
import songRoutes from './routes/api/songs.js'
import timeslotRoutes from './routes/api/timeslots.js'

// Initialize express app
const app: Application = express()
const server: http.Server = http.createServer(app)
const io: SocketIOServer = new SocketIOServer(server)

// Middlewares
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')))

// Set EJS as templating engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Routes
app.use('/', indexRouter)
app.use('/', listenerRouter)
app.use('/', producerRouter)
app.use('/', djRouter)
app.use('/api', djRoutes)
app.use('/api', songRoutes)
app.use('/api', timeslotRoutes)

// Serve Socket.io client
app.get('/socket.io/socket.io.js', (_, res: Response) => {
    res.sendFile(path.join(__dirname, '/node_modules/socket.io-client/dist/socket.io.js'))
})

io.on('connection', (socket) => {
    console.log('A user connected')
})

// Connect to MongoDB
const username: string = process.env.MONGODB_USERNAME || ""
const password: string = process.env.MONGODB_PASSWORD || ""
const clusterID: string = process.env.MONGODB_CLUSTER_ID || ""
const mongoURI: string = `mongodb+srv://${username}:${password}@${clusterID}.mongodb.net/?retryWrites=true&w=majority`

const mongoClient: MongoClient = new MongoClient(mongoURI)
let changeStream: ChangeStream | null = null

const shutdown = async (exitCode: number) => {
    console.log("Shutting down...")

    // Close mongoose
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close()
        console.log('Mongoose connection closed.')
    }

    // Close change stream
    if (changeStream) {
        await changeStream.close()
        console.log('Change stream closed.')
    }

    // Close mongodb client
    try {
        await mongoClient.close()
        console.log('MongoDB client closed.')
    } catch (error) {
        console.error('Error closing MongoDB client:', error)
    }

    console.log(`Exiting with code ${exitCode}.`)
    process.exit(exitCode)
}

process.on('SIGINT', () => shutdown(0))
process.on('SIGTERM', () => shutdown(0))

async function run(mongoURI: string) {
    try {
        await mongoose.connect(mongoURI)
        console.log('Connected to MongoDB Atlas...')
    } catch (error: unknown) {
        console.error('Could not connect to MongoDB Atlas...', error)
        await shutdown(1)
    }
}

async function setupChangeStream() {
    try {
        // Connect web socket to MongoDB
        await mongoClient.connect()
        const db: mongoose.mongo.Db = mongoClient.db()
        changeStream =  db.watch()

        // Listen for changes in the database
        changeStream.on('change', (change: ChangeStreamDocument<any>) => {
            console.log('Change detected:', change)

            // Emit update event when a real-time change occurs
            io.emit('databaseUpdate')
        })
    } catch (error: unknown) {
        console.error('Error setting up change stream:', error)
        await shutdown(1)
    }
}

// Set up change stream, then shut down gracefully
run(mongoURI)
    .then(setupChangeStream)
    .catch ((error: unknown ) => {
        console.error(`Database changestream error: ${error}\n Shutting down gracefully...`)
        shutdown(1)
    })

// Start server
const PORT: number = 3000
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})

export {}