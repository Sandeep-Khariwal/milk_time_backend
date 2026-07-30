import express from "express";

import {
  CreateDairySale,
  GetTodayDairySales,
  GetAllDairySales,
  DeleteDairySale,
} from "../controller/dairySale.controller";

const dairySaleRouter = express.Router();

dairySaleRouter.post("/create", CreateDairySale);

dairySaleRouter.get("/today/:id", GetTodayDairySales);

dairySaleRouter.get("/all/:id", GetAllDairySales);

dairySaleRouter.delete("/:id", DeleteDairySale);

export default dairySaleRouter;