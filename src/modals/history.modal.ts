import { model, Schema } from "mongoose";

interface HistoryModel {
  _id: string;
  user:string;
  firm:string;
  productName:string;
  description:string;
  amount:number;
  quantity:number;
  date: Date;
}
const historySchema = new Schema<HistoryModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
  
    user: {
      type: String,
      ref:"user"
    },
    firm: {
      type: String,
      ref:"firm"
    },
    productName: {
      type: String,
      default:""
    },
    description: {
      type: String,
      default:""
    },
    amount: {
      type: Number,
      default:0
    },
    quantity: {
      type: Number,
      default:0
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model<HistoryModel>("history", historySchema);
