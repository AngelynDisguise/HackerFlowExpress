import mongoose, { Schema, Document, Model } from "mongoose"

const timeslotSchema = new Schema({
  slot: String
}, {_id : false})

export type TimeslotData = mongoose.InferSchemaType<typeof timeslotSchema>
export interface ITimeslot extends Document, TimeslotData {}

const Timeslot: Model<ITimeslot> = mongoose.model<ITimeslot>('Timeslot', timeslotSchema)

export default Timeslot
