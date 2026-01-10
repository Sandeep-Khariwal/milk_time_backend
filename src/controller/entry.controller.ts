import { Request, Response } from "express";
import { EntryService } from "../services/entry.service";
import { UserService } from "../services/user.service";

export const CreateEntry = async (req: Request, res: Response) => {
  const data = req.body;
  const entryService = new EntryService();
  const userService = new UserService();

  let response;

  if (data._id) {
    response = await entryService.editEntry(data);
  } else {
    response = await entryService.createEntry(data);
  }

  if (response["status"] === 200) {
    if (data._id) {
      const actualAmount = response["actualAmount"];
      // update earnings in user
      await userService.addEarnings(data.customer, actualAmount);
      res.status(response["status"]).json({
        status: response["status"],
        message: response["message"],
      });
    } else {
      const entry = response["entry"];
      //update entry id in customer
      await userService.addEntryId(data.customer, entry._id);
      // update earnings in user
      await userService.addEarnings(data.customer, entry.amount);

      res.status(response["status"]).json({
        status: response["status"],
        data: response["entry"],
        message: response["message"],
      });
    }
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};

export const GetUserEntries = async (req: Request, res: Response) => {
  const { id } = req.params;
    const data = req.query;
  const userService = new UserService();
  const entriesService = new EntryService();

  const response = await userService.getEntries(id);

  if (response["status"] === 200) {
    const entryIds = response["user"].milkEntry;

    const resp = await entriesService.getEntriesByIds(id,entryIds,data);

    if (resp["status"] === 200) {
      res.status(200).json({
        status: 200,
        data: resp["entries"],
      });
    } else {
      res.status(200).json({
        status: 200,
        message: response["message"],
      });
    }
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
export const GetTodayAllEntries = async (req: Request, res: Response) => {
  const { id } = req.params;
  const entriesService = new EntryService();

  const response = await entriesService.getTodayEntriesByCustomer(id);

  if (response["status"] === 200) {
    res.status(200).json({
      status: 200,
      data: response["entries"],
    });
  } else {
    res
      .status(response["status"])
      .json({ status: response["status"], message: response["message"] });
  }
};
