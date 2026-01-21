import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const DataBase = async () => {
  try {

    await mongoose.connect(process.env.DATABASE.trim() as string);

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error while connecting to the database:", error);
    process.exit(1);
  }
};

// const { MongoClient, ServerApiVersion } = require("mongodb");


