import { authenticateToken } from "./../middleware/jwtToken";
import { randomUUID } from "crypto";
import Firm from "../modals/firm.modal";

export class FirmService {
  public async createFirm(data: { name: string; admin: string }) {
    try {
      const firm = new Firm();
      firm._id = `FIRM-${randomUUID()}`;
      firm.name = data.name;
      firm.admin = data.admin;

      const savedFirm = await firm.save();

      return { status: 200, firm: savedFirm, message: "Firm Created!!" };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }

  public async updateFirmName(id: string, name: string) {
    try {
      const firm = await Firm.findByIdAndUpdate(id, {
        $set: { name: name },
      });

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }

      return { status: 200, message: "name updated successfully!!" };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }
  public async addNewCustomer(id: string, cId: string) {
    try {
      const firm = await Firm.findByIdAndUpdate(id, {
        $push: { customers: cId },
      });

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }

      return { status: 200, message: "updated successfully!!" };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }
  public async removeCustomer(id: string, cId: string) {
    try {
      const firm = await Firm.findByIdAndUpdate(id, {
        $pull: { customers: cId },
      });

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }

      return { status: 200, message: "Updated successfully!!" };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }
    public async removeDistributer(id: string, dId: string) {
    try {
      const firm = await Firm.findByIdAndUpdate(id, {
        $pull: { distributers: dId },
      });

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }

      return { status: 200, message: "Updated successfully!!" };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }
  public async addNewDistributer(id: string, dId: string) {
    try {
      const firm = await Firm.findByIdAndUpdate(id, {
        $push: { distributers: dId },
      });

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }
 
      return { status: 200, message: "Updated successfully!!" };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }
  public async addNewFarmer(id: string, fId: string) {
    try {
      const firm = await Firm.findByIdAndUpdate(id, {
        $push: { distributers: fId },
      });

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }
 
      return { status: 200, message: "Updated successfully!!" };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }

  public async addNewStock(
    id: string,
    data: {
      item: string;
      quantity: number;
      price: number;
    }
  ) {
    try {
      const firm = await Firm.findByIdAndUpdate(id, {
        $push: { stocks: data },
      },{new:true});

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }

      return {
        status: 200,
        stocks: firm.stocks,
        message: "Stocks created successfully!!",
      };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }
  public async editStock(
    id: string,
    data: {
      item: string;
      quantity: number;
      price: number;
      _id:string
    }
  ) {
    try {
    const firm = await Firm.findOneAndUpdate(
      { _id: id, "stocks._id": data._id },
      {
        $set: {
          "stocks.$.item": data.item,
          "stocks.$.quantity": data.quantity,
          "stocks.$.price": data.price,
        },
      },
      { new: true }
    );

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }

      return {
        status: 200,
        stocks: firm.stocks,
        message: "Stocks created successfully!!",
      };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }
  public async deleteStock(
  firmId: string,
  stockId: string
) {
  try {
    const firm = await Firm.findByIdAndUpdate(
      firmId,
      {
        $pull: { stocks: { _id: stockId } },   // remove matching stock
      },
      { new: true }
    );

    if (!firm) {
      return { status: 404, message: "Firm not found!!" };
    }

    return {
      status: 200,
      stocks: firm.stocks,
      message: "Stock deleted successfully!!",
    };
  } catch (error: any) {
    return { status: 500, message: error.message };
  }
}

  public async getAllStock(id: string) {
    try {
      const firm = await Firm.findById(id);

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }

      return {
        status: 200,
        stocks: firm.stocks,
        message: "Stocks fetch successfully!!",
      };
    } catch (error:any) {
      return { status: 500, message: error.message };
    }
  }

  public async addStock(firmId: string, stockId: string, quantity: number) {
    try {
      // Step 1: Check if the firm and specific stock exist
      const firm = await Firm.findOne(
        { _id: firmId, "stocks._id": stockId },
        { "stocks.$": 1 } // fetch ONLY the matched stock
      );

      if (!firm) {
        return { status: 404, message: "Firm or Stock not found!!" };
      }

      // Step 2: Increase quantity
      const updatedFirm = await Firm.findOneAndUpdate(
        {
          _id: firmId,
          "stocks._id": stockId, // match by _id (not item name)
        },
        {
          $inc: { "stocks.$.quantity": quantity },
        },
        { new: true }
      );

      return {
        status: 200,
        stocks: updatedFirm.stocks,
        message: "Stock increased successfully!!",
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }

  public async saleStock(id: string, stockId: string, quantity: number) {
    
    try {
      const firm = await Firm.findById(id);

      if (!firm) {
        return { status: 404, message: "Firm not found!!" };
      }

      // Find the stock item inside the firm's stocks
      const stock = firm.stocks.find((s: any) => s._id.toString() === stockId);
      
      

      if (!stock) {
        return { status: 404, message: "Stock item not found!!" };
      }
      
      // Check if enough quantity is available
      if (stock.quantity < quantity) {
        return {
          status: 400,
          message: `Not enough stock! Available: ${stock.quantity}`,
        };
      }

      // Decrease quantity
      stock.quantity = stock.quantity  - quantity;
      // Save updated firm
      await firm.save();


      return {
        status: 200,
        stocks: firm.stocks,
        message: "Stock updated successfully!!",
      };
    } catch (error: any) {
      return { status: 500, message: error.message };
    }
  }
}
