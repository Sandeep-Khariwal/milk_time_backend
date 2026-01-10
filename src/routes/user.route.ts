import express  from "express";
import { CreateUser, DeleteUser, getAllCustomers, GetAllDistributers, getAllFarmers, GetAllUsers, GetUser, GetUserById, LoginUser, SaleProduct, SetPaymentForUser } from "../controller/user.controller";
import { authenticateToken } from "../middleware/jwtToken";
const userRouter = express.Router();

userRouter.post("/create", CreateUser );
userRouter.post("/login", LoginUser );
userRouter.put("/saleProduct/:id", SaleProduct);

userRouter.put("/delete/:id", DeleteUser);
userRouter.put("/setPayment/:id", SetPaymentForUser);


userRouter.get("/getUser", authenticateToken, GetUser );
userRouter.get("/getUser/:id",  GetUserById );

userRouter.get("/getAllDistributers/:id", GetAllDistributers );
userRouter.get("/getAllCustomers/:id", getAllCustomers);
userRouter.get("/getAllFarmers/:id", getAllFarmers);

export default userRouter