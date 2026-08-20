import { Request, Response } from "express";
import { MilkRateService } from "../services/milkRate.service";

export const UploadMilkRateChart = async (
  req: Request,
  res: Response,
) => {
  try {
    const { firmId } = req.body;

    if (!firmId) {
      return res.status(400).json({
        status: 400,
        message: "Firm ID is required!!",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        status: 400,
        message: "Excel file is required!!",
      });
    }

    const milkRateService = new MilkRateService();

    const response = await milkRateService.uploadRateChart(
      firmId,
      req.file.path,
    );

    return res.status(response.status).json({
      status: response.status,
      message: response.message,
      chart: response.chart,
    });
  } catch (error: any) {
    console.error("Upload Milk Rate Controller Error:", error);

    return res.status(500).json({
      status: 500,
      message: error.message,
    });
  }

};

  export const GetActiveMilkRateChart = async (
  req: Request,
  res: Response,
) => {
  try {
    const { firmId } = req.params;

    if (!firmId) {
      return res.status(400).json({
        status: 400,
        message: "Firm ID is required!!",
      });
    }

    const milkRateService = new MilkRateService();

    const response = await milkRateService.getActiveRateChart(firmId);

    return res.status(response.status).json({
      status: response.status,
      message: response.message,
      chart: response.chart,
    });
  } catch (error) {
    console.error("Get Milk Rate Chart Controller Error:", error);

    return res.status(500).json({
      status: 500,
      message: "Unable to fetch milk rate chart",
    });
  }
};