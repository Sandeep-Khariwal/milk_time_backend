import { Request, Response } from "express";
import * as dotenv from "dotenv";
import { myRazorpayInstance } from "../app";
import crypto from "crypto";
import { FirmService } from "../services/firm.service";
import Payment from "../modals/payment.model";
dotenv.config();

export const GetRazorpayKeys = (req: Request, res: Response) => {
  console.log("api called....");

  res.status(200).json({
    status: 200,
    data: {
      RAZORPAY_API_KEY: process.env.RAZORPAY_API_KEY!,
    },
  });
};

export const CreateOrder = async (req: Request, res: Response) => {
  const { amount } = req.body;

  try {
    console.log("amount...........", amount);
    const options = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    console.log("working1...........", options, myRazorpayInstance);

    const order = await myRazorpayInstance.orders.create(options);
    console.log("working2...........", order);
    res.status(200).json({
      status: 200,
      data: order,
    });
  } catch (error: any) {
    console.log("error : ", error);

    res.status(500).json({ status: 500, error: error });
  }
};

export const PaymentSuccess = async (req: Request, res: Response) => {
  const firmService = new FirmService();
  const secret = process.env.WEBHOOK_SECRET;
  const signature = req.headers["x-razorpay-signature"];
  const body = JSON.stringify(req.body);

  const expectedSignature = crypto
    .createHmac("sha256", secret || "")
    .update(body.toString())
    .digest("hex");

  if (signature === expectedSignature) {
    const event = req.body;
    // Handle event like payment.captured
    if (event.event === "payment.captured") {
      const payment = req.body.payload.payment.entity;
      const paymentId = req.body.payload.payment.entity.id;

      const notes = payment.notes;

      const existingPayment = await Payment.findOne({ paymentId });
      if (existingPayment) {
        console.log("⚠️ Payment already processed:", payment.id);
        return res.status(200).send("ok");
      }

      // Process payment
      await Payment.create({
        paymentId: payment.id,
        amount: payment.amount,
        firm: payment.notes.firmId,
        months: payment.notes.months,
        status: "captured"
      });

      console.log("user : ", paymentId, notes.firmId, notes.months);
      await firmService.updateSubscription(notes.firmId, notes.months);
    } else {
      console.log("payment failed");
        res.status(200).send('ok');
    }
  } else {
    console.log("Invalid signature");
      res.status(200).send('ok');
  }
};
