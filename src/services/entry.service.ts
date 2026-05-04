import { randomUUID } from "crypto";
import Entry from "../modals/entries.modal";
import moment from "moment-timezone";
import {
  formatDate,
  getCurrentTimeZoneIST,
  getTodayDDMMYYYY,
} from "../helper/helperFunctions";

export class EntryService {
  // ✅ CREATE ENTRY (original)
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
      entry.rate = data.rate;
      entry.isBuffalo = data.isBuffalo;

      // ✅ ORIGINAL: just store date
      entry.date = data.date;

      if (data.fat) {
        entry.fat = data.fat;
      }

      const savedEntry = await entry.save();

      return { status: 200, entry: savedEntry, message: "Entry Created!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  // ✅ EDIT ENTRY (original)
  public async editEntry(data: {
    _id: string;
    weight: number;
    fat: number;
    rate: number;
    amount: number;
    customer: string;
    firm: string;
    date: Date;
  }) {
    try {
      const entry = await Entry.findById(data._id);

      if (!entry) {
        return { status: 404, message: "Entry not found!!" };
      }

      const previousAmount = entry.amount;
      const actualAmount = data.amount - previousAmount;

      await Entry.findByIdAndUpdate(data._id, {
        ...data,
        date: data.date,
      });

      return {
        status: 200,
        actualAmount,
        message: "Entry Updated!!",
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  // ✅ ORIGINAL FILTER LOGIC (DB-based, not string)
  public async getEntriesByIds(id: string, data: any) {
    try {
      const { fromDate, toDate, skip = 0 } = data;

      const query: any = {
        customer: id,
      };

      const limit = 31;
      const skipValue = Number(skip);

      // ✅ CASE 1: No filter → current month (IST safe)
      if (!fromDate && !toDate) {
        const start = moment()
          .tz("Asia/Kolkata")
          .startOf("month") // 1st 12:00 AM IST
          .toDate();

        const end = moment()
          .tz("Asia/Kolkata")
          .endOf("month") // last day 11:59 PM IST
          .toDate();

        query.date = {
          $gte: start,
          $lte: end,
        };
      }

      // ✅ CASE 2: Filter applied (IST safe)
      if (fromDate && toDate) {
        const start = moment
          .tz(fromDate, "Asia/Kolkata")
          .startOf("day") // 12:00 AM IST
          .toDate();

        const end = moment
          .tz(toDate, "Asia/Kolkata")
          .endOf("day") // 11:59 PM IST
          .toDate();

        query.date = {
          $gte: start,
          $lte: end,
        };
      }

      console.log("get entry query :", query);

      const entries = await Entry.find(query)
        .sort({ date: 1 })
        .skip(fromDate && toDate ? 0 : skipValue)
        .limit(fromDate && toDate ? 0 : limit);

      return { status: 200, entries };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  // ✅ MORNING ENTRY (original)
  public async getAllUserIdIfTodayMorningEntry(firmId: string) {
    try {
      const startTime = new Date();
      const endTime = new Date();

      startTime.setHours(0, 0, 0, 0);
      endTime.setHours(11, 59, 59, 999);

      const users = await Entry.find({
        firm: firmId,
        date: {
          $gte: startTime,
          $lte: endTime,
        },
        timeZone: "M",
      }).select("customer");

      return { status: 200, users };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  // ✅ EVENING ENTRY (original)
  public async getAllUserIdIfTodayEveningEntry(firmId: string) {
    try {
      const startTime = new Date();
      const endTime = new Date();

      startTime.setHours(12, 0, 0, 0);
      endTime.setHours(23, 59, 59, 999);

      const users = await Entry.find({
        firm: firmId,
        date: {
          $gte: startTime,
          $lte: endTime,
        },
        timeZone: "E",
      }).select("customer");

      return { status: 200, users };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  // ✅ TODAY ENTRIES (original)
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
