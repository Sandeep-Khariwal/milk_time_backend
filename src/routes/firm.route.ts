import express  from "express";
import { AddStock, CreateFirm, CreateNewStock, DeleteStock, GetAllStocks } from "../controller/firm.controller";
import { authenticateToken } from "../middleware/jwtToken";
const firmRouter = express.Router();

firmRouter.post("/create", CreateFirm);
firmRouter.post("/addNewProduct/:id", CreateNewStock);
firmRouter.post("/addStock/:firmId/:stockId", AddStock);

firmRouter.get("/stocks/:id", GetAllStocks);
firmRouter.put("/delete/:id", authenticateToken, DeleteStock );
export default firmRouter
