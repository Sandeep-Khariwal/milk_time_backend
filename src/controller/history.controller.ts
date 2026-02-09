import { Request, Response } from "express";
import { HistoryService } from "../services/history.service";
import { UserService } from "../services/user.service";
import { FirmService } from "../services/firm.service";
import { UserType } from "../interfaces";

export const CreateHistory = async (req: Request, res: Response) => {
  const data = req.body;
  const historyService = new HistoryService();
  const userService = new UserService();
  const firmService = new FirmService();
  let isCustomer = false;
  if (data.userType === UserType.CUSTOMER) {
    isCustomer = true;
  }

  const histData = {
    ...data,
    amount: isCustomer ? data.amount : -data.amount,
  };

  const response: any = await historyService.createHistory(histData);

  await firmService.saleStock(data.firm, data.stockId, data.quantity);

  if (response["status"] === 200) {
    const history = response["history"];

    if (data.user) {
      let userResp: any;
      userResp = await userService.addHistoryInUser(
        data.user,
        history._id,
        data.amount,
        isCustomer,
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

export const GetUserAllHistory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const historyService = new HistoryService();

  const response = await historyService.getUserAllsHistory(id);

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

export const UpdateHistory = async(req: Request, res: Response) => {

  const { id } = req.params;
  const { userId, quantity, amount } = req.body;

  const historyService = new HistoryService();
  const userService = new UserService();

  

  const histResp = await historyService.updateHistory(id, quantity, amount);

  if (histResp["status"] === 200) {

    const actualAmount: number = histResp["nextAmount"]??0;
    await userService.addEarnings(userId, actualAmount);

    res.status(histResp["status"]).json({
      status: histResp["status"],
      message: histResp["message"],
    })

  } else {
    res
      .status(histResp["status"])
      .json({ status: histResp["status"], message: histResp["message"] });
  }
};

export const DeleteHistory = async (req: Request, res: Response) => {

  const { id } = req.params;
  const { userId, amount, userType } = req.body;

  const historyService = new HistoryService();
  const userService = new UserService();

  let isCustomer = false;
  let updateAmount = amount;
  if (userType === UserType.CUSTOMER) {
    isCustomer = true;
   updateAmount = -amount
  }

  // calculate the earnings
  await userService.addHistoryInUser(userId, id, updateAmount, isCustomer);
  const response: any = await historyService.deleteHistoryById(id);

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
