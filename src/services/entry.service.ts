import { randomUUID } from "crypto";
import Entry from "../modals/entries.modal";

export class EntryService {
  public async createEntry(data: {
    weight: number;
    fat: number;
    rate: number;
    amount: number;
    customer: string;
    firm: string;
  }) {
    try {
      console.log("data : ", data);

      const entry = new Entry();
      entry._id = `ENTY-${randomUUID()}`;
      entry.weight = data.weight;
      entry.amount = data.amount;
      entry.customer = data.customer;
      entry.firm = data.firm;

      if (data.fat) {
        entry.fat = data.fat;
      }

      const savedEntry = await entry.save();

      return { status: 200, entry: savedEntry, message: "Entry Created!!" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  public async editEntry(data: {
    _id: string;
    weight: number;
    fat: number;
    rate: number;
    amount: number;
    customer: string;
    firm: string;
  }) {
    try {
      const entry = await Entry.findById(data._id);

      if (!entry) {
        return { status: 404, message: "Entry not found!!" };
      }

      const previousAmount = entry.amount;

      let actualAmount;

      if (previousAmount > data.amount) {
        actualAmount = data.amount - previousAmount;
      } else {
        actualAmount = previousAmount - data.amount;
      }

      await Entry.findByIdAndUpdate(data._id, data);

      return {
        status: 200,
        actualAmount: actualAmount,
        message: "Entry Created!!",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getEntriesByIds(ids: string[]) {
    try {
      const entries = await Entry.find({
        _id: { $in: ids },
      });

      return { status: 200, entries };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  public async getTodayEntriesByCustomer(firmId: string) {
    try {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const entries = await Entry.find({
        firm: firmId,
        createdAt: { $gte: start, $lte: end },
      }).populate([
        {
          path:"customer",
          select:["_id","name"]
        }
      ]);

      return { status: 200, entries };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
