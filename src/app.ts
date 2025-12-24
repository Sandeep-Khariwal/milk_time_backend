import { DataBase } from './database';
import express, { Express, Request, Response } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import os from "os";
import cluster from "cluster";
import userRouter from './routes/user.route';
import firmRouter from './routes/firm.route';
import entryRouter from './routes/entries.route';

dotenv.config();

// Prepare uploads directory
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Razorpay setup
// export const myRazorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_API_KEY!,
//   key_secret: process.env.RAZORPAY_API_SECRET!,
// });

const totalCpu = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`🧠 Primary ${process.pid} is running`);

  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(
      `💀 Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`
    );
    // Optional: Restart worker
    // cluster.fork();
  });
} else {
  // Worker Process
  const startServer = async () => {
    try {
      // Connect to DB
      await DataBase();

      const app: Express = express();
      const PORT = process.env.PORT || 9799;
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

      app.listen(PORT, () => {
        console.log(`🚀 Worker ${process.pid} started on port ${PORT}`);
      });
    } catch (error) {
      console.error(`❌ Worker ${process.pid} failed to start:`, error);
      process.exit(1);
    }
  };

  // Global error handlers
  process.on("unhandledRejection", (reason) => {
    console.error(`Unhandled Rejection in Worker ${process.pid}:`, reason);
    process.exit(1);
  });

  process.on("uncaughtException", (err) => {
    console.error(`Uncaught Exception in Worker ${process.pid}:`, err);
    process.exit(1);
  });

  startServer();
}
