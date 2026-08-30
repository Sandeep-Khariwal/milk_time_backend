const mongoose = require("mongoose");
require("dotenv").config();
const History = require("./src/modals/history.modal").default;

async function check() {
  await mongoose.connect(process.env.DATABASE.trim());
  const docs = await History.find().sort({ createdAt: -1 }).limit(10);
  console.log("Recent History documents:");
  console.log(docs);
  process.exit(0);
}

check();
