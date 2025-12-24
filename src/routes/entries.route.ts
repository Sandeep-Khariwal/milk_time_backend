import express  from "express";
import { CreateEntry, GetTodayAllEntries, GetUserEntries } from "../controller/entry.controller";
const entryRouter = express.Router();

entryRouter.post("/create", CreateEntry);
entryRouter.get("/:id", GetUserEntries);
entryRouter.get("/all/:id", GetTodayAllEntries);

export default entryRouter
