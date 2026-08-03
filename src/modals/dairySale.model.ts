import { model, Schema } from "mongoose";

interface DairySaleModel {
  _id: string;
  firm: string;
  customerName?: string;
  weight: number;
  rate: number;
  amount: number;
  date: Date;
}

const dairySaleSchema = new Schema<DairySaleModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },

    firm: {
      type: String,
      ref: "firm",
      required: true,
    },

    customerName: {
      type: String,
      default: "",
      trim: true,
    },

    weight: {
      type: Number,
      required: true,
    },

    rate: {
      type: Number,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model<DairySaleModel>("dairySale", dairySaleSchema);