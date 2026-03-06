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
    isBuffalo: boolean;
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
      entry.isBuffalo = data.isBuffalo;

      if (data.fat) {
        entry.fat = data.fat;
      }

      const savedEntry = await entry.save();

      return { status: 200, entry: savedEntry, message: "Entry Created!!" };
    } catch (error: any) {
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
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getEntriesByIds(id: string, data: any) {
    try {
      const { fromDate, toDate, skip = 0, userType } = data;

      const query: any = {
        customer: id,
      };

      const limit = 31;
      const skipValue = Number(skip);

      // 🔹 CASE 1: No filter → current month only
      if (!fromDate && !toDate) {
        const now = new Date();

        const startOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1,
          0,
          0,
          0,
          0,
        );

        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

        query.date = {
          $gte: startOfMonth,
          $lte: endOfMonth,
        };
      }

      // 🔹 CASE 2: Filter provided → use exact range
      if (fromDate && toDate) {
        const startOfDay = new Date(fromDate);
        startOfDay.setHours(0, 0, 0, 0); // 12:00 AM

        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999); // 11:59:59 PM

        query.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }

      const entries = await Entry.find(query)
        .sort({ date: 1 }) // newest first
        .skip(fromDate && toDate ? 0 : skipValue)
        .limit(fromDate && toDate ? 0 : limit);

      return { status: 200, entries };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getAllUserIdIfTodayEntry(id: string) {
    try {
      // Get today's start and end time
      const now = new Date();
      const hours = now.getHours(); // 0 - 23

      const startTime = new Date();
      const endTime = new Date();

      if (hours < 12) {
        // 🌅 AM: 00:00 → 11:59
        startTime.setHours(0, 0, 0, 0);
        endTime.setHours(11, 59, 59, 999);
      } else {
        // 🌇 PM: 12:00 → 23:59
        startTime.setHours(12, 0, 0, 0);
        endTime.setHours(23, 59, 59, 999);
      }

      const users = await Entry.find({
        firm: id,
        date: {
          $gte: startTime,
          $lte: endTime,
        },
      }).select("customer");

      return { status: 200, users: users };
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
        date: { $gte: start, $lte: end },
      }).populate([
        {
          path: "customer",
          select: ["_id", "name", "userType", "userCode"],
        },
      ]);

      return { status: 200, entries };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
}
