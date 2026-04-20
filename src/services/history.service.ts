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
    date: Date;
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
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getUserAllsHistory(id: string) {
    try {
      const histories: any = await History.find({ user: id })
        .populate({
          path: "user",
          select: ["_id", "name"],
        })
        .sort({ date: -1 });

      if (!histories && !histories.length) {
        return { status: 404, message: "No History found!!" };
      }

      return { status: 200, history: histories };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getUsersHistory(id: string) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // End = now (optional, Mongo will handle it)
      const histories = await History.find({
        user: id,
        date: {
          $gte: startOfMonth,
          $lte: new Date(),
        },
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
      const histories: any = await History.find({ firm: id }).populate({
        path: "user",
        select: ["_id", "name"],
      });

      if (!histories && !histories.length) {
        return { status: 404, message: "No History found!!" };
      }

      return { status: 200, history: histories };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getOneMonthHistory(id: string) {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      // End = now (optional, Mongo will handle it)
      const histories:any = await History.find({
        firm: id,
        date: {
          $gte: startOfMonth,
          $lte: new Date(),
        },
      }).populate({
        path: "user",
        select: ["_id", "name"],
      });

      if (!histories && !histories.length) {
        return { status: 404, message: "No History found!!" };
      }

      return { status: 200, history: histories };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async updateHistory(id: string, quantity: number, amount: number) {
    try {
      const history = await History.findById(id);

      if (!history) {
        return { status: 404, message: "History not found!" };
      }

      let previusAmount = history.amount;

      let nextAmount = amount - previusAmount;

      history.amount = amount;
      history.quantity = quantity;
      await history.save();

      return {
        status: 200,
        nextAmount: Number(nextAmount),
        message: "History Updated!!",
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async deleteHistoryById(id: string) {
    try {
      const history = await History.findById(id).select(["quantity","productName"])
      await History.findByIdAndDelete(id);
      return { status: 200,history, message: "History Deleted" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
}
