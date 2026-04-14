import { NextFunction, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const generateAccessToken = (data: {
  _id: string;
  phoneNumber: string;
  instituteId?: string;
  name: string;
  subscriptionExp?: Date;
}): string => {
  const payload = {
    _id: data._id,
    phoneNumber: data.phoneNumber,
    name: data.name,
    subscriptionExp: data.subscriptionExp,
    instituteId: data.instituteId,
  };
  return jwt.sign(payload, process.env.TOKEN_SECRET as Secret, {
    expiresIn: "365d",
  });
};

export interface clientRequest extends Request {
  id?: string;
  user?: any;
}

export const blacklistedTokens = new Set();
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const customReq = req as clientRequest;

  try {
    const bearerToken = req.headers["authorization"];

    console.log("bearerToken : ",bearerToken);
    if (!bearerToken) {
      res.status(401).json({ message: "Token not found" });
      return;
    }

    const token = bearerToken.split(" ")[1];
    if (!token) {
      res.status(403).json({ message: "Invalid token format" });
      return;
    }

    // ✅ sync verify (no callback issues)
    let user: any;
    try {
      user = jwt.verify(token, process.env.TOKEN_SECRET as string);
    } catch (err) {
      res.status(403).json({ message: "JWT error" });
      return;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (user.exp < currentTime) {
      res.status(401).json({ message: "Token expired" });
      return;
    }

    const today = new Date();
    const subscriptionExp = new Date(user.subscriptionExp);
    
    if (today > subscriptionExp) {
      console.log("subscriptionExp ✅",user.subscriptionExp);
      res.status(403).json({ status:403, message: "Subscription expired",user });
      return;
    }

      customReq.user = user;
  
      next();


  } catch (error) {
    res.status(401).json({ message: "expired" });
    return
  }
};