import { model, Schema } from "mongoose";

interface EntriesModel {
  _id: string;
  weight: number;
  fat: number;
  rate:number;
  amount: number;
  customer:string;
  firm:string;
  date: Date;
}
const entriesSchema = new Schema<EntriesModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    weight: {
      type: Number,
    },
    fat: {
      type: Number,
      default:1
    },
    amount: {
      type: Number,
    },
    rate: {
      type: Number,
    },
    customer: {
      type: String,
      ref:"user"
    },
    firm: {
      type: String,
      ref:"firm"
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model<EntriesModel>("entry", entriesSchema);
