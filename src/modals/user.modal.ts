import { model, Schema } from "mongoose";

interface UserModel {
  _id: string;
  name: string;
  phoneNumber: string;
  userType: string;
  token: string;
  password: string;
  firmId: string;

  // fields for customers
  earnings?: number;
  milkRate?: number;
  milkEntry?: string[];
  purchasedItem?: { item: string; quantity: number,  amount:number }[];
}
const userSchema = new Schema<UserModel>(
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
    earnings: {
      type: Number,
    },
    token: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    firmId: {
      type: String,
      default: "",
      ref: "firm",
    },
    milkRate: {
      type: Number,
      default: 0,
    },
    userType: {
      type: String,
      default: "",
    },
    purchasedItem: {
      type: [
        {
          item: {
            type: String,
          },
          quantity: {
            type: Number,
          },
          amount: {
            type: Number,
          },
        },
      ],
      default: [],
    },
    milkEntry: {
      type: [String],
      default: [],
      ref:"entry"
    },
  },
  { timestamps: true }
);

export default model<UserModel>("user", userSchema);
