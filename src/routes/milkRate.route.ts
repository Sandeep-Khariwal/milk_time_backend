import express from "express";
import multer from "multer";
import path from "path";
import { UploadMilkRateChart , GetActiveMilkRateChart } from "../controller/milkRate.controller";
const milkRateRouter = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, "../../uploads"));
  },

  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,

  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (extension !== ".xlsx" && extension !== ".xls") {
      return cb(new Error("Only Excel files are allowed!!"));
    }

    cb(null, true);
  },

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

milkRateRouter.post(
  "/upload",
  upload.single("file"),
  UploadMilkRateChart,
);
milkRateRouter.get(
  "/active/:firmId",
  GetActiveMilkRateChart,
);

export default milkRateRouter;