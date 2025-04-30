import mongoose, { Document, Schema, Model } from "mongoose"

// Mongo Schemas
const eventSchema = new Schema({
  eventID: {type: Number, require: true, unique: true},
  dj: String,
  time: String,
  songs: [String]
})

const djSchema = new Schema({  // removed 'Schema' type annotation - makes it 'unkown'
  djID: {type: Number, require: true, unique: true},
  name: String,
  songs: [Number],
  events: [eventSchema]
})

export type EventData = mongoose.InferSchemaType<typeof eventSchema>
export interface IEvent extends Document, EventData {}

export type DJData = mongoose.InferSchemaType<typeof djSchema>
export interface IDJ extends Document, DJData {}

const DJ: Model<IDJ> = mongoose.model<IDJ>('DJ', djSchema)

export default DJ
