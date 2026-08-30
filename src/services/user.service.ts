import { randomUUID } from "crypto";
import User from "../modals/user.modal";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../middleware/jwtToken";
import bookkeepingModel from "../modals/bookkeeping.model";
import Entry from "../modals/entries.modal";
import History from "../modals/history.modal";

export class UserService {
  public async createUser(data: {
    name: string;
    phoneNumber: string;
    password: string;
    userType: string;
    firmId: string;
    userCode: string;
    hisabCycleDays?: number;
    buffaloRate: number;
    cowRate: number;
    cowMilk?: {
      activeCowMilk: boolean;
      fixedAmount: boolean;
      fatAmount: boolean;
      snfAmount: boolean;
      morningTimeMilk: boolean;
      eveningTimeMilk: boolean;
    };
    buffaloMilk?: {
      activeBuffaloMilk: boolean;
      fixedAmount: boolean;
      fatAmount: boolean;
      snfAmount: boolean;
      morningTimeMilk: boolean;
      eveningTimeMilk: boolean;
    };
  }) {
    try {
      const isUserPresent = await User.findOne({
        phoneNumber: data.phoneNumber,
      });
      if (isUserPresent) {
        return { status: 401, message: "User Already Exist!!" };
      }
      const user = new User();
      user._id = `USER-${randomUUID()}`;
      user.name = data.name;
      user.phoneNumber = data.phoneNumber;
      user.userType = data.userType;
      user.firmId = data.firmId;

      if (data.userCode) {
        user.userCode = data.userCode;
      }

      if (data.hisabCycleDays) {
        user.hisabCycleDays = data.hisabCycleDays;
      }

      if (data.buffaloRate) {
        user.buffaloRate = data.buffaloRate;
        user.buffaloMilk = data.buffaloMilk;
      }
      if (data.cowRate) {
        user.cowRate = data.cowRate;
        user.cowMilk = data.cowMilk;
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      user.password = hashedPassword;

      const savedUser = await user.save();

      return { status: 200, user: savedUser, message: "User Created!!" };
    } catch (error: any) {
      console.log("error : ", error);

      return { status: 500, message: error.message };
    }
  }

  public async updatePassword(id: string, password: string) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await User.findByIdAndUpdate(
        id,
        { $set: { password: hashedPassword } },
        { new: true },
      );

      return { status: 200, user, message: "Password Updated!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getAllUsers(firmId: string) {
    const userCounts = await User.aggregate([
      {
        $match: {
          firmId,
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$userType",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      customers: 0,
      farmers: 0,
      distributers: 0,
    };

    userCounts.forEach((item) => {
      if (item._id === "customer") result.customers = item.count;
      if (item._id === "farmer") result.farmers = item.count;
      if (item._id === "distributer") result.distributers = item.count;
    });

    return { status: 200, data: result };
  }

  public async updateUser(
    id: string,
    data: {
      name: string;
      phoneNumber: string;
      password: string;
      userType: string;
      firmId: string;
      hisabCycleDays?: number;
      buffaloRate: number;
      cowRate: number;
      cowMilk?: {
        fixedAmount: boolean;
        fatAmount: boolean;
        snfAmount: boolean;
        morningTimeMilk: boolean;
        eveningTimeMilk: boolean;
      };
      buffaloMilk?: {
        fixedAmount: boolean;
        fatAmount: boolean;
        snfAmount: boolean;
        morningTimeMilk: boolean;
        eveningTimeMilk: boolean;
      };
    },
  ) {
    try {
      let hashedPassword;
      if (data.password) {
        const saltRounds = 10;
        hashedPassword = await bcrypt.hash(data.password, saltRounds);
      }
      const updateData = {
        ...data,
        buffaloRate: data.buffaloRate,
        cowRate: data.cowRate,
        password: hashedPassword,
      };
      const savedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      return { status: 200, user: savedUser, message: "User updated!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async updateFirmInAdmin(id: string, firmId: string) {
    try {
      await User.findByIdAndUpdate(id, { $set: { firmId: firmId } });
      return { status: 200, message: "Admin updated!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getUserById(id: string) {
    try {
      const user = await User.findOne({ _id: id, isDeleted: false }).populate([
        {
          path: "firmId",
          select: ["_id", "name"],
        },
      ]);

      if (!user) {
        return { status: 404, message: "User not found!!" };
      }

      return { status: 200, user, message: "user get successfully!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async restoreUserById(id: string) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true },
      );

      if (!user) {
        return { status: 404, message: "User not found!!" };
      }

      return { status: 200, user, message: "user updated successfully!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getDeletedUsers(id: string) {
    try {
      const users: any = await User.find({
        firmId: id,
        isDeleted: true,
      }).select([
        "_id",
        "name",
        "phoneNumber",
        "cowRate",
        "buffaloRate",
        "userType",
        "userCode",
      ]);

      if (!users && users.length) {
        return { status: 404, message: "User not found!!" };
      }

      return { status: 200, users, message: "users get successfully!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllUserByFirmId(id: string) {
    try {
      const users: any = await User.find({
        firmId: id,
        isDeleted: false,
      }).select([
        "_id",
        "name",
        "phoneNumber",
        "buffaloRate",
        "userCode",
        "cowRate",
        "cowMilk",
        "buffaloMilk",
        "hisabCycleDays",
      ]);

      if (!users && users.length) {
        return { status: 404, message: "User not found!!" };
      }

      return { status: 200, users: users, message: "user get successfully!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllDistributersByFirmId(id: string) {
    try {
      const users: any = await User.find({
        firmId: id,
        isDeleted: false,
        userType: "distributer",
      }).select(["_id", "name", "phoneNumber", "userType", "userCode"]);

      if (!users && users.length) {
        return { status: 404, message: "User not found!!" };
      }

      return { status: 200, users: users, message: "user get successfully!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getAllCustomersByFirmId(id: string) {
    try {
      const users: any = await User.find({
        firmId: id,
        isDeleted: false,
        userType: "customer",
      }).select([
        "_id",
        "name",
        "phoneNumber",
        "buffaloRate",
        "cowRate",
        "userCode",
        "userType",
        "cowMilk",
        "buffaloMilk",
        "hisabCycleDays",
      ]);

      if (!users && users.length) {
        return { status: 404, message: "User not found!!" };
      }

      const tUsers = users.map((user: any) => {
        const { milkRate, ...rest } = user.toObject();

        return {
          ...rest,
          rate: milkRate,
        };
      });

      return { status: 200, users: tUsers, message: "user get successfully!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getAllFarmersByFirmId(id: string) {
    try {
      const users: any = await User.find({
        firmId: id,
        isDeleted: false,
        userType: "farmer",
      }).select([
        "_id",
        "name",
        "phoneNumber",
        "buffaloRate",
        "userCode",
        "cowRate",
        "cowMilk",
        "buffaloMilk",
        "hisabCycleDays",
        "earnings",
      ]);

      if (!users && users.length) {
        return { status: 404, message: "User not found!!" };
      }

      return { status: 200, users: users, message: "user get successfully!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
  public async loginUser(number: string, password: string) {
    try {
      const user: any = await User.findOne({
        phoneNumber: number,
        isDeleted: false,
      }).populate([
        {
          path: "firmId",
          select: ["_id", "name", "subscriptionExp"],
        },
      ]);

      if (!user) {
        return { status: 404, message: "User not found!!" };
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return { status: 500, message: "Invalid email or password" };
      }

      let tokenPayload: any = {
        _id: user._id,
        instituteId: user.firmId._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      };

      let isSubscriptionExp = false;
      // if (user.firmId?.subscriptionExp) {
      //   tokenPayload.subscriptionExp = user.firmId?.subscriptionExp;

      //   const today = new Date();
      //   const subscriptionExp = new Date(user.firmId?.subscriptionExp);
      //   console.log("today subscriptionExp : ",today,subscriptionExp);
      //   isSubscriptionExp = today > subscriptionExp;
      // }

      const token = generateAccessToken(tokenPayload);

      return {
        status: 200,
        user,
        token,
        isSubscriptionExp,
        message: "Login successfully!!",
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async createAdmin(data: {
    name: string;
    phoneNumber: string;
    password: string;
  }) {
    try {
      const isUserPresent = await User.findOne({
        phoneNumber: data.phoneNumber,
      });
      if (isUserPresent) {
        return { status: 401, message: "User Already Exist!!" };
      }
      const user = new User();
      user._id = `ADMN-${randomUUID()}`;
      user.name = data.name;
      user.phoneNumber = data.phoneNumber;
      user.userType = "admin";
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const subscriptionExp = new Date();
      subscriptionExp.setHours(0, 0, 0, 0);

      const token = generateAccessToken({
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        subscriptionExp,
      });

      user.password = hashedPassword;

      const savedUser = await user.save();

      return {
        status: 200,
        admin: savedUser,
        token,
        message: "User Created!!",
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async productPurchase(
    id: string,
    data: {
      item: string;
      quantity: number;
      amount: number;
    },
  ) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        {
          $push: { purchasedItem: data },
          $inc: { earnings: -data.amount },
        },
        { new: true },
      );

      if (!user) {
        return { status: 404, message: "user not fond!!" };
      }

      return { status: 200, user };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
  public async deleteUserById(id: string) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true },
      );

      return { status: 200, user, message: "User Deleted!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
  public async deleteParmanentUserById(id: string) {
    try {
      await User.findByIdAndDelete(id);

      return { status: 200, message: "User Deleted!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async addEntryId(id: string, entryId: string) {
    try {
      const user = await User.findByIdAndUpdate(id, {
        $push: { milkEntry: entryId },
      });

      if (!user) {
        return { status: 404, message: "user not fond!!" };
      }

      return { status: 200, message: "Entry added!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
  public async addEarnings(id: string, amount: number) {
    try {
      const user = await User.findByIdAndUpdate(id, {
        $inc: { earnings: amount },
      });

      if (!user) {
        return { status: 404, message: "user not fond!!" };
      }
      return { status: 200, message: "Earnings updated!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getEntries(id: string) {
    try {
      const user = await User.findById(id).select("milkEntry");

      if (!user) {
        return { status: 404, message: "user not fond!!" };
      }
      return { status: 200, user };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async addHistoryInUser(
    id: string,
    historyId: string,
    amount: number,
    isCustomer: boolean,
  ) {
    try {
      await User.findByIdAndUpdate(
        id,
        {
          $push: { history: historyId },
          $inc: { earnings: isCustomer ? amount : -amount },
        },
        { new: true },
      );

      return { status: 200, nessage: "user updated!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async removeHistoryFromUser(id: string, historyId: string) {
    try {
      await User.findByIdAndUpdate(
        id,
        {
          $pull: { history: historyId },
        },
        { new: true },
      );

      return { status: 200, nessage: "user updated!!" };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getUsersBookings(id: string) {
    try {

      const bookkeeping: any = await bookkeepingModel.find({
        userId: id,
      });

      if (!bookkeeping && !bookkeeping.length) {
        return {
          status: 404,
          message: "No Bookings Found!!",
        };
      }

      return { status: 200, bookkeeping };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async createBookKeeping(
    id: string,
    data: {
      cowWeight: number;
      buffalowWeight: number;
      cowAmount: number;
      buffaloAmount: number;
      totalAmount: number;
    },
  ) {
    try {
      const user = await User.findById(id);

      if (!user) {
        return {
          status: 404,
          message: "User Not Found!!",
        };
      }

      const bookingKeep = new bookkeepingModel();
      bookingKeep._id = `BKNK-${randomUUID()}`;
      bookingKeep.userId = id;
      bookingKeep.cowWeight = data.cowWeight;
      bookingKeep.buffalowWeight = data.buffalowWeight;
      bookingKeep.cowAmount = data.cowAmount;
      bookingKeep.buffaloAmount = data.buffaloAmount;
      bookingKeep.totalAmount = data.totalAmount;

      const savedBookingKeep = await bookingKeep.save();

      return {
        status: 200,
        nessage: "bookingKeep created!!",
        bookingkeep: savedBookingKeep,
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async getSettlementSummary(id: string, fromDate: Date, toDate: Date) {
    try {
      const user = await User.findById(id);
      if (!user) {
        return { status: 404, message: "User not found!!" };
      }

      // Fetch all entries on or after fromDate to calculate previous pending backwards
      const futureEntries = await Entry.find({
        customer: id,
        date: { $gte: fromDate }
      });

      const futureHistory = await History.find({
        user: id,
        date: { $gte: fromDate }
      });

      let futureEntriesSum = 0;
      futureEntries.forEach(e => {
        futureEntriesSum += Number(e.amount || 0);
      });

      let futureHistorySum = 0;
      futureHistory.forEach(h => {
        futureHistorySum += Number(h.amount || 0);
      });

      const previousPending = (user.earnings || 0) - futureEntriesSum - futureHistorySum;

      // Filter out records strictly within fromDate and toDate for current period
      const currentEntries = futureEntries.filter(e => e.date <= toDate);
      const currentHistory = futureHistory.filter(h => h.date <= toDate);

      let currentPeriodAmount = 0;
      let paid = 0;

      const financialHistory: any[] = [];

      currentEntries.forEach(e => {
        const amt = Number(e.amount || 0);
        currentPeriodAmount += amt;
        financialHistory.push({
          type: "milk",
          date: e.date,
          reason: e.isBuffalo ? "Buffalo Milk Collection" : "Cow Milk Collection",
          amount: amt
        });
      });

      currentHistory.forEach(h => {
        const amt = Number(h.amount || 0);
        // Payments typically have no productName. Purchases have productName.
        const isPayment = !h.productName;
        if (isPayment) {
          paid += amt;
        } else {
          currentPeriodAmount += amt;
        }

        financialHistory.push({
          type: isPayment ? "payment" : "purchase",
          date: h.date,
          reason: isPayment ? (h.description || "Payment Received") : `Purchased: ${h.productName}`,
          amount: amt
        });
      });

      financialHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const totalPayable = previousPending + currentPeriodAmount;
      const remaining = totalPayable + paid;

      return {
        status: 200,
        financialHistory,
        settlement: {
          periodStart: fromDate,
          periodEnd: toDate,
          previousPending,
          currentPeriodAmount,
          totalPayable,
          paid,
          remaining
        },
        message: "Settlement summary fetched successfully"
      };

    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
}
