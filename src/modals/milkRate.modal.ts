import { model, Schema } from "mongoose";

interface MilkRate {
  fat: number;
  rates: {
    snf: number;
    rate: number;
  }[];
}

interface MilkRateChartModel {
  _id: string;
  firmId: string;
  rates: MilkRate[];
  version: number;
  isActive: boolean;
  uploadedAt: Date;
}

const milkRateChartSchema = new Schema<MilkRateChartModel>(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },

    firmId: {
      type: String,
      required: true,
      ref: "firm",
      index: true,
    },

    rates: {
      type: [
        {
          fat: {
            type: Number,
            required: true,
          },

          rates: {
            type: [
              {
                snf: {
                  type: Number,
                  required: true,
                },

                rate: {
                  type: Number,
                  required: true,
                },
              },
            ],
            default: [],
          },
        },
      ],
      default: [],
    },

    version: {
      type: Number,
      default: 1,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

milkRateChartSchema.index({
  firmId: 1,
  isActive: 1,
});

export default model<MilkRateChartModel>(
  "milkRateChart",
  milkRateChartSchema,
);