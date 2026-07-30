import { Request, Response } from "express";
import { DairySaleService } from "../services/dairySale.service";

export const CreateDairySale = async (req: Request, res: Response) => {
  const data = req.body;

  const dairySaleService = new DairySaleService();

  const response = await dairySaleService.createSale(data);

  res.status(response["status"]).json(response);
};

export const GetTodayDairySales = async (req: Request, res: Response) => {
  const { id } = req.params;

  const dairySaleService = new DairySaleService();

  const response = await dairySaleService.getTodaySales(id);

  res.status(response["status"]).json(response);
};

export const GetAllDairySales = async (req: Request, res: Response) => {
  const { id } = req.params;

  const dairySaleService = new DairySaleService();

  const response = await dairySaleService.getAllSales(id);

  res.status(response["status"]).json(response);
};

export const DeleteDairySale = async (req: Request, res: Response) => {
  const { id } = req.params;

  const dairySaleService = new DairySaleService();

  const response = await dairySaleService.deleteSale(id);

  res.status(response["status"]).json(response);
};