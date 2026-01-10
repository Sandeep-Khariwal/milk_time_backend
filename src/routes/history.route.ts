import express  from "express";
import { CreateHistory, GetAllHistory, GetUserHistory } from "../controller/history.controller";
const historyRouter = express.Router();

historyRouter.post("/create", CreateHistory);

historyRouter.get("/user/:id", GetUserHistory);
historyRouter.get("/all/:id", GetAllHistory);
export default historyRouter
