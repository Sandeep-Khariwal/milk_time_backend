import { randomUUID } from "crypto";
import Entry from "../modals/entries.modal";
import moment from "moment-timezone";
import {
  formatDate,
  getCurrentTimeZoneIST,
  getTodayDDMMYYYY,
} from "../helper/helperFunctions";

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
      entry.rate = data.rate;
      entry.isBuffalo = data.isBuffalo;
      entry.date = formatDate(data.date); //new Date(customDate);

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
    date: Date;
  }) {
    try {
      const entryDate = new Date(data.date);
      entryDate.setMinutes(entryDate.getMinutes() + 330);
      const entry = await Entry.findById(data._id);

      if (!entry) {
        return { status: 404, message: "Entry not found!!" };
      }

      const previousAmount = entry.amount;

      const actualAmount = data.amount - previousAmount;
      await Entry.findByIdAndUpdate(data._id, { ...data, date: entryDate });

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
    const { fromDate, toDate } = data;

    let entries = await Entry.find({
      customer: id,
    });

    const toNumber = (d: string) => {
      const [day, month, year] = d.split("-");
      return Number(`${year}${month}${day}`);
    };

    // 🔹 CASE 1: filter applied
    if (fromDate && toDate) {
      const fromStr = formatDate(new Date(fromDate));
      const toStr = formatDate(new Date(toDate));

      const fromNum = toNumber(fromStr);
      const toNum = toNumber(toStr);

      entries = entries.filter((entry: any) => {
        const entryNum = toNumber(entry.date);
        return entryNum >= fromNum && entryNum <= toNum;
      });
    } 
    // 🔹 CASE 2: no filter → current month
    else {
      const today = getTodayDDMMYYYY(); // "04-05-2026"
      const [_, month, year] = today.split("-");

      entries = entries.filter((entry: any) => {
        const [d, m, y] = entry.date.split("-");
        return m === month && y === year;
      });
    }

    // optional sort after filtering
    entries.sort((a: any, b: any) => toNumber(a.date) - toNumber(b.date));

    return { status: 200, entries };
  } catch (error: any) {
    return { status: 500, message: error.message };
  }
}

  public async getAllUserIdIfTodayMorningEntry(firmId: string) {
    try {
      const today = getTodayDDMMYYYY();
      const shift = getCurrentTimeZoneIST(); // 🔥 dynamic

      const users = await Entry.find({
        firm: firmId,
        date: today,
        timeZone: shift,
      }).select("customer");

      return { status: 200, users };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllUserIdIfTodayEveningEntry(firmId: string) {
    try {
      const today = getTodayDDMMYYYY(); // same function you already use

      const users = await Entry.find({
        firm: firmId,
        date: today,
        timeZone: "E",
      }).select("customer");

      return { status: 200, users };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getTodayEntriesByCustomer(firmId: string) {
    try {
      const today = getTodayDDMMYYYY(); // "03-05-2026"

      const entries = await Entry.find({
        firm: firmId,
        date: today,
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
