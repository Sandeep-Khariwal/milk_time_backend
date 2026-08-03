import { randomUUID } from "crypto";
import DairySale from "../modals/dairySale.model";

export class DairySaleService {
  // CREATE
  public async createSale(data: {
    firm: string;
    customerName?: string;
    weight: number;
    rate: number;
    date: Date;
  }) {
    try {
      const sale = new DairySale();

      sale._id = `DS-${randomUUID()}`;
      sale.firm = data.firm;
      sale.customerName = data.customerName || "";
      sale.weight = Number(data.weight);
      sale.rate = Number(data.rate);

      // amount backend calculate karega
      sale.amount = Number(data.weight) * Number(data.rate);

      sale.date = data.date;

      const savedSale = await sale.save();

      return {
        status: 200,
        sale: savedSale,
        message: "Sale Created Successfully",
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  // TODAY SALES
  public async getTodaySales(firmId: string) {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const sales = await DairySale.find({
        firm: firmId,
        date: {
          $gte: start,
          $lte: end,
        },
      }).sort({ createdAt: -1 });

      const summary = sales.reduce(
        (acc, item) => {
          acc.weight += Number(item.weight);
          acc.amount += Number(item.amount);
          acc.count += 1;
          return acc;
        },
        {
          weight: 0,
          amount: 0,
          count: 0,
        }
      );

      return {
        status: 200,
        sales,
        summary,
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  // ALL SALES
  public async getAllSales(firmId: string) {
    try {
      const sales = await DairySale.find({
        firm: firmId,
      }).sort({
        date: -1,
      });

      return {
        status: 200,
        sales,
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error.message,
      };
    }
  }

  // DELETE
  public async deleteSale(id: string) {
    try {
      await DairySale.findByIdAndDelete(id);

      return {
        status: 200,
        message: "Sale Deleted",
      };
    } catch (error: any) {
      return {
        status: 500,
        message: error.message,
      };
    }
  }
}