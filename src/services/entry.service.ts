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
      console.log("data : ", data);

      const entry = await Entry.findById(data._id);

      if (!entry) {
        return { status: 404, message: "Entry not found!!" };
      }

      const previousAmount = entry.amount;

      const actualAmount = data.amount - previousAmount;

      console.log("actualAmount : ", actualAmount);

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
  ids: string[],
  data: any
) {
  try {
    const { fromDate, toDate, skip = "0" } = data;

    const query: any = {
      customer: id,
    };

    // ✅ DATE FILTER
    if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const limit = 31; // change as needed
    const skipValue = Number(skip);
    

    const entries = await Entry.find(query)
      // .sort({ createdAt: -1 })
      .skip(fromDate && toDate ? 0 : skipValue) // no skip when date filter
      .limit(fromDate && toDate ? 0 : limit);

      console.log("entries : ",entries);
      

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
          select: ["_id", "name", "userType"],
        },
      ]);

      return { status: 200, entries };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}
