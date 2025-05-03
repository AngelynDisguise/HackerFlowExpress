import mongoose, { Schema, Document, Model } from "mongoose"

const timeslotSchema = new Schema({
  slot: String
}, {_id : false})

export type Timeslot = mongoose.InferSchemaType<typeof timeslotSchema>
export interface ITimeslot extends Document, Timeslot {}

const TimeslotModel: Model<ITimeslot> = mongoose.model<ITimeslot>('Timeslot', timeslotSchema)

export default TimeslotModel
