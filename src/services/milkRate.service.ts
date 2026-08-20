import { randomUUID } from "crypto";
import * as XLSX from "xlsx";
import MilkRateChart from "../modals/milkRate.modal";
import fs from "fs/promises";

export class MilkRateService {
  public async uploadRateChart(
    firmId: string,
    filePath: string,
  ) {
    try {
      // 1. Excel file read karo
      const workbook = XLSX.readFile(filePath);

      // 2. First sheet select karo
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        return {
          status: 400,
          message: "Excel sheet not found!!",
        };
      }

      const worksheet = workbook.Sheets[sheetName];

      // 3. Excel ko 2D array mein convert karo
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
      });

      if (!rows.length) {
        return {
          status: 400,
          message: "Excel file is empty!!",
        };
      }

      // First row mein SNF values hain
      const headerRow = rows[0];

      if (!headerRow || headerRow.length < 2) {
        return {
          status: 400,
          message: "Invalid rate chart format!!",
        };
      }

      // SNF columns
      const snfValues = headerRow
        .slice(1)
        .filter((value: any) => value !== null && value !== "")
        .map((value: any) => Number(value));

      if (
        !snfValues.length ||
        snfValues.some((value: number) => Number.isNaN(value))
      ) {
        return {
          status: 400,
          message: "Invalid SNF values. Please upload the correct Milk Rate Chart Excel file.",
        };
      }

      if (!snfValues.length) {
        return {
          status: 400,
          message: "SNF values not found in Excel!!",
        };
      }

      const rates: {
        fat: number;
        rates: {
          snf: number;
          rate: number;
        }[];
      }[] = [];

      // 4. Har Fat row ko process karo
      for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex];

        if (!row || row.length < 2) {
          continue;
        }

        const fat = Number(row[0]);

        if (Number.isNaN(fat)) {
          return {
            status: 400,
            message: `Invalid Fat value at row ${rowIndex + 1}`,
          };
        }

        const snfRates: {
          snf: number;
          rate: number;
        }[] = [];

        for (let colIndex = 0; colIndex < snfValues.length; colIndex++) {
          const rateValue = row[colIndex + 1];

          if (
            rateValue === null ||
            rateValue === "" ||
            rateValue === undefined
          ) {
            return {
              status: 400,
              message: `Rate missing for Fat ${fat}, SNF ${snfValues[colIndex]}`,
            };
          }

          const rate = Number(rateValue);

          if (Number.isNaN(rate)) {
            return {
              status: 400,
              message: `Invalid rate for Fat ${fat}, SNF ${snfValues[colIndex]}`,
            };
          }

          snfRates.push({
            snf: snfValues[colIndex],
            rate,
          });
        }

        rates.push({
          fat,
          rates: snfRates,
        });
      }

      if (!rates.length) {
        return {
          status: 400,
          message: "No rate data found in Excel!!",
        };
      }

      // 5. Purana active chart inactive karo
      await MilkRateChart.updateMany(
        {
          firmId,
          isActive: true,
        },
        {
          $set: {
            isActive: false,
          },
        },
      );

      // 6. New chart save karo
      const previousChart = await MilkRateChart.findOne({
        firmId,
      }).sort({ version: -1 });

      const version = previousChart
        ? previousChart.version + 1
        : 1;

      const newChart = new MilkRateChart({
        _id: `RATE-${randomUUID()}`,
        firmId,
        rates,
        version,
        isActive: true,
        uploadedAt: new Date(),
      });

      const savedChart = await newChart.save();

      await fs.unlink(filePath);

      return {
        status: 200,
        chart: savedChart,
        message: "Milk rate chart uploaded successfully!!",
      };
    } catch (error: any) {
      console.error("Milk Rate Upload Error:", error);

      return {
        status: 500,
        message: "Unable to upload milk rate chart. Please check the Excel file and try again.",
      };
    }
  }
  public async getActiveRateChart(firmId: string) {
  try {
    const chart = await MilkRateChart.findOne({
      firmId,
      isActive: true,
    }).sort({ version: -1 });

    if (!chart) {
      return {
        status: 404,
        message: "Milk rate chart not found",
      };
    }

    return {
      status: 200,
      chart,
      message: "Milk rate chart fetched successfully",
    };
  } catch (error: any) {
    console.error("Get Milk Rate Chart Error:", error);

    return {
      status: 500,
      message: "Unable to fetch milk rate chart",
    };
  }
}
}

