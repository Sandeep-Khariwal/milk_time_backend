import { model, Schema } from "mongoose";

interface EntriesModel {
  _id: string;
  weight: number;
  fat: number;
  rate:number;
  amount: number;
  snf: number;
  clr: number;
  customer:string;
  firm:string;
  timeZone:string;
  isBuffalo:boolean;
  isEdited:boolean;
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
      default:0
    },
    amount: {
      type: Number,
    },
    snf: {
      type: Number,
      default:0
    },
    clr: {
      type: Number,
      default:0
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
    timeZone: {
      type: String,
    },
    isBuffalo: {
      type: Boolean,
      default:false
    },
    isEdited: {
      type: Boolean,
      default:false
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default model<EntriesModel>("entry", entriesSchema);
