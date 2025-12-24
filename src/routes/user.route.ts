import express  from "express";
import { CreateUser, DeleteUser, GetAllUsers, GetUser, GetUserById, LoginUser, SaleProduct } from "../controller/user.controller";
import { authenticateToken } from "../middleware/jwtToken";
const userRouter = express.Router();

userRouter.post("/create", CreateUser );
userRouter.post("/login", LoginUser );
userRouter.put("/saleProduct/:id", SaleProduct);

userRouter.put("/delete/:id", DeleteUser);


userRouter.get("/getUser", authenticateToken, GetUser );
userRouter.get("/getUser/:id",  GetUserById );
userRouter.get("/getUsers/:id", GetAllUsers );

export default userRouter