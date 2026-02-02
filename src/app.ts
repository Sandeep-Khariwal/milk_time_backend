import { DataBase } from "./database";
import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import os from "os";
import cluster from "cluster";
import userRouter from "./routes/user.route";
import firmRouter from "./routes/firm.route";
import entryRouter from "./routes/entries.route";
import historyRouter from "./routes/history.route";
// import dns from "dns";
// dns.setServers(["8.8.8.8", "8.8.4.4"]);


dotenv.config();

// Prepare uploads directory
// const uploadDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// Razorpay setup
// export const myRazorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_API_KEY!,
//   key_secret: process.env.RAZORPAY_API_SECRET!,
// });

// Worker Process
const startServer = async () => {
  try {
    // Connect to DB
    await DataBase();

    const app: Express = express();
    const PORT = process.env.PORT || 9000;
    const VERSION = "v1";

    // Middleware
    app.use(cors());
    app.use(
      express.json({
        strict: false,
        verify: (req: Request, res: Response, buf) => {
          if (!buf.length) {
            req.body = {};
          }
        },
      })
    );
    app.use(express.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: "50mb" }));

    // 👇 Serve uploaded files publicly
    app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
    // Routes
    app.use(`/api/${VERSION}/user`, userRouter);
    app.use(`/api/${VERSION}/firm`, firmRouter);
    app.use(`/api/${VERSION}/entry`, entryRouter);
    app.use(`/api/${VERSION}/history`, historyRouter);

    app.listen(PORT, () => {
      console.log(`🚀 started on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`❌ failed to start:`, error);
    process.exit(1);
  }
};

startServer();
