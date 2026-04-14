import express  from "express";
import { CreateOrder, GetRazorpayKeys, PaymentSuccess } from "../controller/payment.controller";
const paymentRouter = express.Router();

paymentRouter.get("/getKeys", GetRazorpayKeys);

paymentRouter.post("/create-order", CreateOrder);
paymentRouter.post("/", PaymentSuccess);

export default paymentRouter