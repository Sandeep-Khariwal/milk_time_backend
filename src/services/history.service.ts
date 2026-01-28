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
    date:Date
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
      if (data.date) {
        history.date = new Date(data.date);
      }

      const savedHistory = await history.save();

      return { status: 200, history: savedHistory, message: "History created" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getUserAllsHistory(id: string) {
    try {
      const histories = await History.find({ user: id })
        .populate({
          path: "user",
          select: ["_id", "name"],
        })
        .sort({ date: -1 });

      if (!histories && !histories.length) {
        return { status: 404, message: "No History found!!" };
      }

      return { status: 200, history: histories };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getUsersHistory(id: string) {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const histories = await History.find({
        user: id,
        date: { $gte: oneMonthAgo },
      })
        .populate({
          path: "user",
          select: ["_id", "name"],
        })
        .sort({ date: -1 });

      if (!histories || histories.length === 0) {
        return { status: 404, message: "No History found!!" };
      }

      return { status: 200, history: histories };
    } catch (error: any) {
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
