import { randomUUID } from "crypto";
import History from "../modals/history.modal";

export class HistoryService {
  public async createHistory(data: {
    user: string;
    firm: string;
    productName: string;
    description: string;
    amount: number;
    quantity: number;
  }) {
    
    try {
      const history = new History();
      history._id = `HIST-${randomUUID()}`;
      history.user = data.user;
      history.firm = data.firm;
      history.amount = data.amount;

      if (data.quantity) {
        history.quantity = data.quantity;
      }
      if (data.productName) {
        history.productName = data.productName;
      }
      if (data.description) {
        history.description = data.description;
      }

      const savedHistory = await history.save();

      return { status: 200, history:savedHistory, message: "History created" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getUsersHistory(id: string) {
    try {
      const histories = await History.find({ user: id }).populate({
        path: "user",
        select: ["_id", "name"],
      });

      if (!histories && !histories.length) {
        return { status: 404, message: "No History found!!" };
      }

      console.log("histories : ",histories);
      

      return { status: 200, history: histories };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllHistory(id: string) {
    try {
      const histories = await History.find({ firm: id }).populate({
        path: "user",
        select: ["_id", "name"],
      });
      

      if (!histories && !histories.length) {
        return { status: 404, message: "No History found!!" };
      }

      return { status: 200, history: histories };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
