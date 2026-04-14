import { model, Schema } from "mongoose";

interface PaymentModel {
  paymentId: string;
  firm: string;
  months: string;
  status: string;
  amount: number;
}
const paymentSchema = new Schema<PaymentModel>(
  {
    paymentId: {
      type: String,
      default: "",
    },
    firm: {
      type: String,
      ref: "firm",
    },
    months: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export default model<PaymentModel>("payment", paymentSchema);
