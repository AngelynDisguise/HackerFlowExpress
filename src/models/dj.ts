import mongoose, { Document, Schema, Model } from "mongoose"

// Mongo Schemas
const eventSchema = new Schema({
  eventID: {type: Number, require: true, unique: true},
  dj: String,
  time: String,
  songs: [String]
})

const djSchema = new Schema({  // removed 'Schema' type annotation - makes it 'unknown'
  djID: {type: Number, require: true, unique: true},
  name: String,
  songs: [Number],
  events: [eventSchema]
})

export type Event = mongoose.InferSchemaType<typeof eventSchema>
export interface IEvent extends Document, Event {}

export type DJ = mongoose.InferSchemaType<typeof djSchema>
export interface IDJ extends Document, DJ {}

const DJModel: Model<IDJ> = mongoose.model<IDJ>('DJ', djSchema)

export default DJModel
