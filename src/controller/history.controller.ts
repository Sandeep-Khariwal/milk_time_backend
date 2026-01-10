import { Request, Response } from "express";
import { HistoryService } from "../services/history.service";
import { UserService } from "../services/user.service";
import { FirmService } from "../services/firm.service";
import { UserType } from "../interfaces";

export const CreateHistory = async (req: Request, res: Response) => {
  const data = req.body;
  const historyService = new HistoryService();
  const userService = new UserService();
  const firmService = new FirmService()
  const response = await historyService.createHistory(data);
  
  await firmService.saleStock(data.firm,data.stockId,data.quantity)

  if (response["status"] === 200) {
    const history = response["history"];

    if (data.user) {
      let isCustomer = false
      if(data.userType === UserType.CUSTOMER){
        isCustomer = true
      }

      let userResp:any
        userResp = await userService.addHistoryInUser(
          data.user,
          history._id,
          data.amount,
          isCustomer
        );
      

      if (userResp["status"] === 200) {
        res
          .status(userResp["status"])
          .json({ status: userResp["status"], message: userResp["message"] });
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
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetUserHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const historyService = new HistoryService();

  const response = await historyService.getUsersHistory(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: response["history"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetAllHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const historyService = new HistoryService();
  
  const response = await historyService.getAllHistory(id);

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      data: response["history"],
      message: response["message"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
