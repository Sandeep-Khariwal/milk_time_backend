import { model, Schema } from "mongoose";

interface FirmModel {
  _id: string;
  name: string;
  phoneNumber: string;
  admin: string;
  distributers: string[];
  customers: string[];
  stocks: { item: string; quantity: number , price:number }[];
}
const firmSchema = new Schema<FirmModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    admin: {
      type: String,
      default: "",
      ref:"user"
    },
    distributers: {
      type: [String],
      default: [],
      ref: "user",
    },
    customers: {
      type: [String],
      default: [],
      ref: "user",
    },
    stocks: {
      type: [
        {
          item: {
            type: String,
          },
          quantity: {
            type: Number,
          },
          price: {
            type: Number,
          },
        },
      ],
      default:[]
    },
  },
  { timestamps: true }
);

export default model<FirmModel>("firm", firmSchema);
