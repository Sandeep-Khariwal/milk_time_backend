import express  from "express";
import { CreateHistory, GetAllHistory, GetUserAllHistory, GetUserHistory } from "../controller/history.controller";
const historyRouter = express.Router();

historyRouter.post("/create", CreateHistory);

historyRouter.get("/user/:id", GetUserHistory);
historyRouter.get("/user/all/:id", GetUserAllHistory);
historyRouter.get("/all/:id", GetAllHistory);
export default historyRouter
