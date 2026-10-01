const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.DATABASE.trim());
  const db = mongoose.connection;
  const entries = await db.collection('entries').find().limit(50).toArray();
  console.log(JSON.stringify(entries, null, 2));
  process.exit(0);
}
run();
