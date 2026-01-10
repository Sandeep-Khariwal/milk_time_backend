import { UserType } from "../interfaces";
import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { FirmService } from "../services/firm.service";
import { clientRequest } from "../middleware/jwtToken";
import { HistoryService } from "../services/history.service";

export const CreateUser = async (req: Request, res: Response) => {
  const data = req.body;

  const userService = new UserService();
  const firmServices = new FirmService();
  let response;
  if (data._id) {
    response = await userService.updateUser(data._id, data);
  } else {
    response = await userService.createUser(data);
  }
  
  if (response["status"] === 200) {
    let userResp;
    const user = response["user"];
    if (!data._id && user.userType === UserType.CUSTOMER) {
      userResp = await firmServices.addNewCustomer(user.firmId, user._id);
    } else if (!data._id && user.userType === UserType.DISTRIBUTER) {
      userResp = await firmServices.addNewDistributer(user.firmId, user._id);
    } else if (!data._id && user.userType === UserType.FARMER) {
      userResp = await firmServices.addNewFarmer(user.firmId, user._id);
    }
    
    if (data._id || userResp && userResp["status"] === 200) {
      res.status(response["status"]).json({
        status: response["status"],
        user: response["user"],
        message: response["message"],
      });
    } else {
      res
        .status(userResp["status"])
        .json({ status: userResp["status"], message: userResp["message"] });
    }
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const LoginUser = async (req: Request, res: Response) => {
  const { phoneNumber, password } = req.body;
  const userService = new UserService();

  const response = await userService.loginUser(phoneNumber, password);

  if (response["status"] === 200) {
    
    res.status(response["status"]).json({
      status: response["status"],
      user: response["user"],
      token: response["token"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetUser = async (req: clientRequest, res: Response) => {
  const id = req.user._id;
  const userService = new UserService();

  const response = await userService.getUserById(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      user: response["user"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetUserById = async (req: clientRequest, res: Response) => {
const {id} = req.params;
  const userService = new UserService();

  const response = await userService.getUserById(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      user: response["user"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetAllUsers = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const userService = new UserService();

  const response = await userService.getAllUserByFirmId(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      users: response["users"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetAllDistributers = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const userService = new UserService();

  const response = await userService.getAllDistributersByFirmId(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      users: response["users"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const getAllCustomers = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const userService = new UserService();

  const response = await userService.getAllCustomersByFirmId(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      users: response["users"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const getAllFarmers = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const userService = new UserService();

  const response = await userService.getAllFarmersByFirmId(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      users: response["users"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const SetPaymentForUser = async (req: clientRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body
  const userService = new UserService();
  const historyService = new HistoryService()

  const response = await userService.addEarnings(id,data.amount);
  await historyService.createHistory(data)

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const DeleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userService = new UserService();
  const firmService = new FirmService()
console.log(id);

  const response = await userService.deleteUserById(id);

  if (response["status"] === 200) {
      const user = response["user"];
      console.log(user.firmId);
      //remove userId from firm
      await firmService.removeCustomer(user.firmId,id)
    res.status(response["status"]).json({
      status: response["status"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const SaleProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const userService = new UserService();
  const firmService = new FirmService();

  console.log(id,data.firmId, data.stockId, data.quantity);

  // update user
  await userService.productPurchase(id, data);

  //update stock
  const response = await firmService.saleStock(data.firmId, data.stockId, data.quantity);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      stocks: response["stocks"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
