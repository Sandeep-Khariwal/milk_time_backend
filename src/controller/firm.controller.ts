import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { FirmService } from "../services/firm.service";

export const CreateFirm = async (req: Request, res: Response) => {
  const data = req.body;
  const userService = new UserService();
  const firmService = new FirmService();

  const adminResp: any = await userService.createAdmin(data);

  if (adminResp["status"] === 200) {
    const admin = adminResp["admin"];
    const token = adminResp["token"];
    const firmResp: any = await firmService.createFirm({
      name: data.firmName,
      admin: admin._id,
    });

    if (firmResp["status"] === 200) {
      //update firmId in admin
      await userService.updateFirmInAdmin(admin._id, firmResp["firm"]._id);
      res.status(firmResp["status"]).json({
        status: firmResp["status"],
        firm: firmResp["firm"],
        admin,
        token,
        message: firmResp["message"],

      });
    } else {
      res
        .status(firmResp["status"])
        .json({ status: firmResp["status"], message: firmResp["message"] });
    }
  } else {
    res
      .status(adminResp["status"])
      .json({ status: adminResp["status"], message: adminResp["message"] });
  }
};

export const CreateNewStock = async (req: Request, res: Response) => {
  const { id } = req.params;
  const stock = req.body;
  const firmService = new FirmService();
  

  let response;
  if (stock._id) {
    response = await firmService.editStock(id, stock);
  } else {
    response = await firmService.addNewStock(id, {item:stock.item,quantity:Number(stock.quantity),price:Number(stock.price)});
  }

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
export const DeleteStock = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {stockId} = req.body;
  const firmService = new FirmService();

  const response = await firmService.deleteStock(id, stockId);

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
export const GetAllStocks = async (req: Request, res: Response) => {
  const { id } = req.params;
  const firmService = new FirmService();

  const response = await firmService.getAllStock(id);

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

export const AddStock = async (req: Request, res: Response) => {
  const { firmId, stockId } = req.params;
  const data = req.body;
  const firmService = new FirmService();

  //update stock
  const response = await firmService.addStock(firmId, data.quantity,stockId,);

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
export const GetAllFirms = async (req: Request, res: Response) => {

  const firmService = new FirmService();

  //update stock
  const response:any = await firmService.getAllFirms();

  if (response["status"] === 200) {
    res.status(response["status"]).json({
      status: response["status"],
      firms: response["firms"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
