import { randomUUID } from "crypto";
import User from "../modals/user.modal";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "../middleware/jwtToken";

export class UserService {
  public async createUser(data: {
    name: string;
    phoneNumber: string;
    password: string;
    userType: string;
    firmId: string;
    userCode: string;
    buffaloRate: number;
    cowRate: number;
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
      if (data.buffaloRate) {
        user.userCode = data.userCode;
      }
      if (data.cowRate) {
        user.cowRate = data.cowRate;
      }
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      user.password = hashedPassword;

      const savedUser = await user.save();

      return { status: 200, user: savedUser, message: "User Created!!" };
    } catch (error:any) {

      return { status: 500, message: error.message };
    }
  }

  public async updateUser(
    id: string,
    data: {
      name: string;
      phoneNumber: string;
      password: string;
      userType: string;
      firmId: string;
      buffaloRate: number;
      cowRate: number;
    },
  ) {
    try {
      // const saltRounds = 10;
      // const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const updateData = {
        ...data,
        buffaloRate: data.buffaloRate,
        cowRate: data.cowRate,
      };
      const savedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      return { status: 200, user: savedUser, message: "User updated!!" };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }

  public async updateFirmInAdmin(id: string, firmId: string) {
    try {
      await User.findByIdAndUpdate(id, { $set: { firmId: firmId } });
      return { status: 200, message: "Admin updated!!" };
    } catch (error:any) {
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
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }

  public async restoreUserById(id: string) {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { isDeleted: false },
        { new: true }
      );

      if (!user) {
        return { status: 404, message: "User not found!!" };
      }

      return { status: 200, user, message: "user updated successfully!!" };
    } catch (error:any) {
      
      return { status: 500, message: error.message };
    }
  }

  public async getDeletedUsers(id: string) {
    try {
      const users:any = await User.find({ firmId: id, isDeleted: true }).select([
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
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }
  public async getAllUserByFirmId(id: string) {
    try {
      const users:any = await User.find({ firmId: id, isDeleted: false }).select([
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

      return { status: 200, users: users, message: "user get successfully!!" };
    } catch (error:any) {
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
    } catch (error:any) {
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
      const users:any = await User.find({
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
      const user = await User.findOne({
        phoneNumber: number,
        isDeleted: false,
      }).populate([
        {
          path: "firmId",
          select: ["_id", "name"],
        },
      ]);

      if (!user) {
        return { status: 404, message: "User not found!!" };
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return { status: 500, message: "Invalid email or password" };
      }

      const token = generateAccessToken({
        _id: user._id,
        name: user.name,
        phoneNumber: user.phoneNumber,
      });

      return { status: 200, user, token, message: "Login successfully!!" };
    } catch (error:any) {
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

      user.password = hashedPassword;

      const savedUser = await user.save();

      return { status: 200, admin: savedUser, message: "User Created!!" };
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
      console.log("addingEarning : ",id,amount);
      
      const user = await User.findByIdAndUpdate(id, {
        $inc: { earnings: amount },
      });

      if (!user) {
        return { status: 404, message: "user not fond!!" };
      }
      return { status: 200, message: "Earnings updated!!" };
    } catch (error:any) {
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

  public async removeHistoryFromUser(
    id: string,
    historyId: string
  ) {
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
}
