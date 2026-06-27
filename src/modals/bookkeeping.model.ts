import { model, Schema } from "mongoose";

interface BookkeepingModel {
  _id: string;
  userId: string;
  cowWeight: number;
  buffalowWeight: number;
  cowAmount: number;
  buffaloAmount: number;
  totalAmount: number;
  date: Date;
}

const bookkeepingSchema = new Schema<BookkeepingModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true
    },
    cowWeight: {
      type: Number,
      default: 0,
    },
    buffalowWeight: {
      type: Number,
    },
    cowAmount: {
      type: Number,
      default: 0,
    },
    buffaloAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default model<BookkeepingModel>("bookkeeping", bookkeepingSchema);
