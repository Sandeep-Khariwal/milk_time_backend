import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// const uri ="mongodb://user:pass@cluster0-shard-00-00.j9r1cii.mongodb.net:27017,cluster0-shard-00-01.j9r1cii.mongodb.net:27017,cluster0-shard-00-02.j9r1cii.mongodb.net:27017/milkbill?ssl=true&replicaSet=atlas-xxxxx&authSource=admin&retryWrites=true&w=majority"
export const DataBase = async () => {
  try {
    console.log("DATABASE:", process.env.DATABASE);

    await mongoose.connect(process.env.DATABASE as string);

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Error while connecting to the database:", error);
    process.exit(1);
  }
};

// const { MongoClient, ServerApiVersion } = require("mongodb");


