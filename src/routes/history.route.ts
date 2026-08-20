import express from "express";
import {
  CreateHistory,
  DeleteHistory,
  GetAllHistory,
  GetUserAllHistory,
  GetUserHistory,
  GetUserPaymentHistory,
  GetMonthlyPurchaseSummary,
  UpdateHistory,
} from "../controller/history.controller";
const historyRouter = express.Router();

historyRouter.post("/create", CreateHistory);
historyRouter.put("/update/:id", UpdateHistory);
historyRouter.put("/delete/:id", DeleteHistory);

historyRouter.get("/user/:id", GetUserHistory);
historyRouter.get("/user/all/:id", GetUserAllHistory);
historyRouter.get("/all/:id", GetAllHistory);
historyRouter.get(
  "/user/monthly-summary/:id",
  GetMonthlyPurchaseSummary
);
historyRouter.get(
  "/user/payment/:id",
  GetUserPaymentHistory
);



export default historyRouter
