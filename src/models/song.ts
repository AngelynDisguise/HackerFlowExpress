import mongoose, { Schema, Document, Model } from "mongoose"

// Mongo schemas
const genreSchema = new Schema({
  electronic: Boolean,
  lofi: Boolean,
  ambient: Boolean,
  classical: Boolean
}, {_id : false})

const songSchema = new Schema({
  songID: {type: Number, require: true, unique: true},
  title: String,
  album: String,
  artist: String,
  genre: genreSchema, // embededd document
  popularity: Number
})

export type SongData = mongoose.InferSchemaType<typeof songSchema>
export interface ISong extends Document, SongData {}

const Song: Model<ISong> = mongoose.model<ISong>('Song', songSchema)

export default Song


