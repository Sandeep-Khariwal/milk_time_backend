import { randomUUID } from "crypto";
import Entry from "../modals/entries.modal";
import { log } from "console";

export class EntryService {
  public async createEntry(data: {
    weight: number;
    fat: number;
    rate: number;
    amount: number;
    customer: string;
    timeZone: string;
    date: Date;
    firm: string;
  }) {
    try {
      const entry = new Entry();
      entry._id = `ENTY-${randomUUID()}`;
      entry.weight = data.weight;
      entry.amount = data.amount;
      entry.customer = data.customer;
      entry.firm = data.firm;
      entry.timeZone = data.timeZone;
      entry.date = data.date;
      entry.rate = data.rate;

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

      const actualAmount = data.amount - previousAmount;
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

public async getEntriesByIds(
  id: string,
  data: any
) {
  try {
    const { fromDate, toDate, skip = 0, userType } = data;

    const query: any = {
      customer: id,
    };

    const today = new Date();

    // ✅ CASE 1: Customer + NO filter + NO skip
    if (
      userType === "customer" &&
      !fromDate &&
      !toDate &&
      Number(skip) === 0
    ) {
      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

      query.date = {
        $gte: startOfMonth,
        $lte: today,
      };
    }

    // ✅ CASE 2: Filter provided → use filter
    if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const limit = 31;
    const skipValue = Number(skip);

    const entries = await Entry.find(query)
      .skip(fromDate && toDate ? 0 : skipValue)
      .limit(fromDate && toDate ? 0 : limit) 

      

    return { status: 200, entries };
  } catch (error: any) {
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
          path: "customer",
          select: ["_id", "name", "userType" , "userCode"],
        },
      ]);

      return { status: 200, entries };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
