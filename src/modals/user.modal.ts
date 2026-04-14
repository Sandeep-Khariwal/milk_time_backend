import { model, Schema } from "mongoose";

interface UserModel {
  _id: string;
  name: string;
  phoneNumber: string;
  userType: string;
  token: string;
  password: string;
  firmId: string;
  userCode: string;
  isDeleted: boolean;

  // fields for customers
  earnings?: number;
  buffaloRate?: number;
  cowRate?: number;
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
  milkEntry?: string[];
  history?: string[];

  purchasedItem?: { item: string; quantity: number; amount: number }[];
}
const userSchema = new Schema<UserModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    earnings: {
      type: Number,
    },
    token: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
    firmId: {
      type: String,
      default: "",
      ref: "firm",
    },
    userCode: {
      type: String,
      default: "",
    },
    buffaloRate: {
      type: Number,
      default: 0,
    },
    cowRate: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      default: "",
    },
    purchasedItem: {
      type: [
        {
          item: {
            type: String,
          },
          quantity: {
            type: Number,
          },
          amount: {
            type: Number,
          },
        },
      ],
      default: [],
    },
    cowMilk: {
      type: {
        activeCowMilk: {
          type: Boolean,
          default: false,
        },
        fixedAmount: {
          type: Boolean,
          default: false,
        },
        fatAmount: {
          type: Boolean,
          default: false,
        },
        snfAmount: {
          type: Boolean,
          default: false,
        },
        morningTimeMilk: {
          type: Boolean,
          default: false,
        },
        eveningTimeMilk: {
          type: Boolean,
          default: false,
        },
      },
    },
    buffaloMilk: {
      type: {
        activeBuffaloMilk: {
          type: Boolean,
          default: false,
        },
        fixedAmount: {
          type: Boolean,
          default: false,
        },
        fatAmount: {
          type: Boolean,
          default: false,
        },
        snfAmount: {
          type: Boolean,
          default: false,
        },
        morningTimeMilk: {
          type: Boolean,
          default: false,
        },
        eveningTimeMilk: {
          type: Boolean,
          default: false,
        },
      },
    },
    milkEntry: {
      type: [String],
      default: [],
      ref: "entry",
    },
    history: {
      type: [String],
      default: [],
      ref: "history",
    }
  },
  { timestamps: true },
);

export default model<UserModel>("user", userSchema);
