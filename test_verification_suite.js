const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const { getISTDayBoundaries, getISTShiftInfo } = require("./dist/helper/helperFunctions");
const { EntryService } = require("./dist/services/entry.service");
const { FirmService } = require("./dist/services/firm.service");
const Entry = require("./dist/modals/entries.modal").default;
const Firm = require("./dist/modals/firm.modal").default;
const User = require("./dist/modals/user.modal").default;

const entryService = new EntryService();
const firmService = new FirmService();

async function runTestSuite() {
  console.log("======================================================================");
  console.log("           MILK BILL – COMPREHENSIVE FINAL VERIFICATION SUITE         ");
  console.log("======================================================================");

  let testCount = 0;
  let passedCount = 0;
  const testResults = [];

  function recordTest(name, passed, detail = "") {
    testCount++;
    if (passed) {
      passedCount++;
      testResults.push({ id: testCount, name, status: "PASS", detail });
      console.log(`[PASS #${testCount}] ${name} ${detail ? "(" + detail + ")" : ""}`);
    } else {
      testResults.push({ id: testCount, name, status: "FAIL", detail });
      console.error(`[FAIL #${testCount}] ${name} ${detail ? "(" + detail + ")" : ""}`);
      throw new Error(`Test #${testCount} Failed: ${name}`);
    }
  }

  // ------------------------------------------------------------------
  // SECTION 1: DAILY GREEN/RED STATUS LOGIC & IST BOUNDARIES
  // ------------------------------------------------------------------
  console.log("\n>>> SECTION 1: DAILY GREEN/RED STATUS & IST BOUNDARIES <<<");

  // Test 1-6: IST boundaries at various times of the day
  const testTimes = [
    { label: "7:00 AM IST", utc: "2026-11-28T01:30:00.000Z" },
    { label: "11:00 AM IST", utc: "2026-11-28T05:30:00.000Z" },
    { label: "12:00 PM IST (noon)", utc: "2026-11-28T06:30:00.000Z" },
    { label: "5:00 PM IST", utc: "2026-11-28T11:30:00.000Z" },
    { label: "11:59 PM IST", utc: "2026-11-28T18:29:00.000Z" },
  ];

  const expectedStartUtc = "2026-11-27T18:30:00.000Z"; // 00:00:00 IST Nov 28
  const expectedEndUtc = "2026-11-28T18:29:59.999Z";   // 23:59:59.999 IST Nov 28

  testTimes.forEach((t) => {
    const { dayStartUtc, dayEndUtc } = getISTDayBoundaries(new Date(t.utc));
    recordTest(
      `IST Day Boundaries at ${t.label}`,
      dayStartUtc.toISOString() === expectedStartUtc && dayEndUtc.toISOString() === expectedEndUtc,
      `Start: ${dayStartUtc.toISOString()}, End: ${dayEndUtc.toISOString()}`
    );
  });

  // Test 6: Next calendar day transition at 12:00 AM IST
  const nextMidnight = new Date("2026-11-28T18:30:00.000Z");
  const nextBoundaries = getISTDayBoundaries(nextMidnight);
  recordTest(
    "Next calendar day transition at 12:00 AM IST",
    nextBoundaries.dayStartUtc.toISOString() === "2026-11-28T18:30:00.000Z",
    `Next Start: ${nextBoundaries.dayStartUtc.toISOString()}`
  );

  // ------------------------------------------------------------------
  // SECTION 2: LIVE DATABASE ISOLATED STATUS & EDIT VERIFICATION
  // ------------------------------------------------------------------
  console.log("\n>>> SECTION 2: LIVE DB STATUS, REFRESH, & EDIT DYNAMICS <<<");

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.DATABASE.trim());
  console.log("Connected to MongoDB successfully.");

  const prefix = `TEST-VERIFY-${Date.now()}`;
  const testFirm1 = `${prefix}-FIRM1`;
  const testFirm2 = `${prefix}-FIRM2`;
  const farmerMorning = `${prefix}-FARMER-M`;
  const customerEvening = `${prefix}-CUSTOMER-E`;
  const userNoEntry = `${prefix}-USER-NONE`;
  const userOtherFirm = `${prefix}-USER-FIRM2`;

  const entryMorningId = `${prefix}-ENTRY-M`;
  const entryEveningId = `${prefix}-ENTRY-E`;
  const entryYesterdayId = `${prefix}-ENTRY-YEST`;
  const entryFirm2Id = `${prefix}-ENTRY-F2`;

  try {
    // Ensure clean state for isolated IDs
    await Firm.deleteMany({ _id: { $in: [testFirm1, testFirm2] } });
    await Entry.deleteMany({ firm: { $in: [testFirm1, testFirm2] } });

    await Firm.create({
      _id: testFirm1,
      name: "Test Verification Firm 1",
      address: "Isolated Test Address",
      stocks: [],
    });

    await Firm.create({
      _id: testFirm2,
      name: "Test Verification Firm 2",
      address: "Isolated Test Address 2",
      stocks: [],
    });

    const now = new Date();
    const { dayStartUtc } = getISTDayBoundaries(now);
    const morningDate = new Date(dayStartUtc.getTime() + 7 * 60 * 60 * 1000);  // 7 AM IST today
    const eveningDate = new Date(dayStartUtc.getTime() + 18 * 60 * 60 * 1000); // 6 PM IST today
    const yesterdayDate = new Date(dayStartUtc.getTime() - 6 * 60 * 60 * 1000); // Yesterday

    // 1. Farmer morning entry in Firm 1
    await Entry.create({
      _id: entryMorningId,
      customer: farmerMorning, // Entry stores user reference in 'customer'
      firm: testFirm1,
      weight: 10,
      amount: 500,
      rate: 50,
      timeZone: "M",
      date: morningDate,
    });

    // 2. Customer evening entry in Firm 1
    await Entry.create({
      _id: entryEveningId,
      customer: customerEvening,
      firm: testFirm1,
      weight: 5,
      amount: 300,
      rate: 60,
      timeZone: "E",
      date: eveningDate,
    });

    // 3. User with yesterday entry only in Firm 1
    await Entry.create({
      _id: entryYesterdayId,
      customer: userNoEntry,
      firm: testFirm1,
      weight: 8,
      amount: 400,
      rate: 50,
      timeZone: "M",
      date: yesterdayDate,
    });

    // 4. Entry in Firm 2 for userOtherFirm
    await Entry.create({
      _id: entryFirm2Id,
      customer: userOtherFirm,
      firm: testFirm2,
      weight: 12,
      amount: 600,
      rate: 50,
      timeZone: "M",
      date: morningDate,
    });

    // Test 7: Farmer with Morning entry is GREEN
    const initialStatusRes = await entryService.getUserIdsWithEntryToday(testFirm1, now);
    const initialActiveUsers = new Set(initialStatusRes.userIds || []);

    recordTest(
      "Farmer with 7:00 AM Morning entry is GREEN (in active Set)",
      initialActiveUsers.has(farmerMorning),
      `User ID: ${farmerMorning}`
    );

    // Test 8: Customer with Evening entry is GREEN
    recordTest(
      "Customer with 6:00 PM Evening entry is GREEN (in active Set)",
      initialActiveUsers.has(customerEvening),
      `User ID: ${customerEvening}`
    );

    // Test 9: Person with 0 entries today is RED
    recordTest(
      "Person with only yesterday's entry is RED (not in active Set)",
      !initialActiveUsers.has(userNoEntry),
      `User ID: ${userNoEntry}`
    );

    // Test 10: Firm isolation (Entry in Firm 2 does NOT affect Firm 1)
    recordTest(
      "Entry in Firm 2 does not affect Firm 1 status (Firm isolation)",
      !initialActiveUsers.has(userOtherFirm),
      `Firm 2 User ID: ${userOtherFirm}`
    );

    // Test 11: Morning entry remains GREEN at 12:00 PM noon IST
    const noonTime = new Date(dayStartUtc.getTime() + 12 * 60 * 60 * 1000);
    const noonStatusRes = await entryService.getUserIdsWithEntryToday(testFirm1, noonTime);
    const noonActiveUsers = new Set(noonStatusRes.userIds || []);
    recordTest(
      "Morning entry remains GREEN through 12:00 PM noon IST",
      noonActiveUsers.has(farmerMorning),
      "No noon shift reset"
    );

    // Test 12: Morning entry remains GREEN at 11:30 PM night IST
    const nightTime = new Date(dayStartUtc.getTime() + 23.5 * 60 * 60 * 1000);
    const nightStatusRes = await entryService.getUserIdsWithEntryToday(testFirm1, nightTime);
    const nightActiveUsers = new Set(nightStatusRes.userIds || []);
    recordTest(
      "Morning entry remains GREEN at 11:30 PM night IST",
      nightActiveUsers.has(farmerMorning),
      "Stays GREEN entire day"
    );

    // Test 13: Entry date edit from Today to Yesterday immediately flips person from GREEN to RED
    await entryService.editEntry({
      _id: entryMorningId,
      customer: farmerMorning,
      firm: testFirm1,
      weight: 10,
      amount: 500,
      rate: 50,
      date: yesterdayDate, // Moved to yesterday!
    });
    const afterDateChangeRes = await entryService.getUserIdsWithEntryToday(testFirm1, now);
    const afterDateChangeUsers = new Set(afterDateChangeRes.userIds || []);
    recordTest(
      "Editing entry date from Today to Yesterday updates status from GREEN to RED",
      !afterDateChangeUsers.has(farmerMorning),
      "Date moved to yesterday, correctly removed from today's active set"
    );

    // Test 14: Entry date edit back to Today immediately restores status to GREEN
    await entryService.editEntry({
      _id: entryMorningId,
      customer: farmerMorning,
      firm: testFirm1,
      weight: 10,
      amount: 500,
      rate: 50,
      date: morningDate, // Restored to today!
    });
    const afterRestoreRes = await entryService.getUserIdsWithEntryToday(testFirm1, now);
    const afterRestoreUsers = new Set(afterRestoreRes.userIds || []);
    recordTest(
      "Editing entry date back to Today restores status to GREEN",
      afterRestoreUsers.has(farmerMorning),
      "Date restored to today, immediately present in active set"
    );

    // Test 15: Editing entry customer from Person A to Person B updates both statuses
    await entryService.editEntry({
      _id: entryMorningId,
      customer: userNoEntry, // Transferred to userNoEntry!
      firm: testFirm1,
      weight: 10,
      amount: 500,
      rate: 50,
      date: morningDate,
    });
    const afterCustomerChangeRes = await entryService.getUserIdsWithEntryToday(testFirm1, now);
    const afterCustomerChangeUsers = new Set(afterCustomerChangeRes.userIds || []);
    recordTest(
      "Reassigning entry to a different user makes new user GREEN and old user RED",
      afterCustomerChangeUsers.has(userNoEntry) && !afterCustomerChangeUsers.has(farmerMorning),
      "Old user flipped to RED, new user flipped to GREEN"
    );

    // ------------------------------------------------------------------
    // SECTION 3: STOCK CREATION, PRESERVATION, & CONCURRENCY TESTS
    // ------------------------------------------------------------------
    console.log("\n>>> SECTION 3: STOCK CREATION, PRESERVATION & CONCURRENCY <<<");

    // Test 16: Create first stock item
    const stock1Res = await firmService.addNewStock(testFirm1, {
      item: "Mineral Mixture",
      quantity: 10,
      price: 50,
    });
    let firm1 = await Firm.findById(testFirm1);
    recordTest(
      "Create Stock Item 1 ('Mineral Mixture')",
      stock1Res.status === 200 && firm1.stocks.length === 1 && firm1.stocks[0].item === "Mineral Mixture",
      `Quantity: ${firm1.stocks[0].quantity}, Price: ${firm1.stocks[0].price}`
    );
    const stock1Id = String(firm1.stocks[0]._id);

    // Test 17: Create second stock item - verify item 1 is NOT replaced or deleted!
    const stock2Res = await firmService.addNewStock(testFirm1, {
      item: "Cattle Feed",
      quantity: 20,
      price: 100,
    });
    firm1 = await Firm.findById(testFirm1);
    const itemsList1 = firm1.stocks.map((s) => s.item);
    recordTest(
      "Create Stock Item 2 ('Cattle Feed') preserves Stock Item 1",
      stock2Res.status === 200 &&
        firm1.stocks.length === 2 &&
        itemsList1.includes("Mineral Mixture") &&
        itemsList1.includes("Cattle Feed"),
      `Items: [${itemsList1.join(", ")}]`
    );
    const stock2Id = String(firm1.stocks.find((s) => s.item === "Cattle Feed")._id);

    // Test 18: Verify Stock Item 1 quantity and price are completely unchanged
    const stock1Check = firm1.stocks.find((s) => s.item === "Mineral Mixture");
    recordTest(
      "Stock Item 1 quantity (10) and price (50) remain unchanged",
      stock1Check.quantity === 10 && stock1Check.price === 50,
      `Qty: ${stock1Check.quantity}, Price: ${stock1Check.price}`
    );

    // Test 19: Create third stock item
    const stock3Res = await firmService.addNewStock(testFirm1, {
      item: "Milk Packet",
      quantity: 30,
      price: 60,
    });
    firm1 = await Firm.findById(testFirm1);
    const itemsList2 = firm1.stocks.map((s) => s.item);
    recordTest(
      "Create Stock Item 3 ('Milk Packet') preserves all 3 stock items",
      stock3Res.status === 200 && firm1.stocks.length === 3 && itemsList2.length === 3,
      `Items: [${itemsList2.join(", ")}]`
    );
    const stock3Id = String(firm1.stocks.find((s) => s.item === "Milk Packet")._id);

    // Test 20: Adding duplicate item name increments quantity and updates price
    const dupRes = await firmService.addNewStock(testFirm1, {
      item: "mineral mixture", // case-insensitive test
      quantity: 15,
      price: 55,
    });
    firm1 = await Firm.findById(testFirm1);
    const updatedStock1 = firm1.stocks.find((s) => s.item.toLowerCase() === "mineral mixture");
    recordTest(
      "Duplicate item addition increments quantity (10 + 15 = 25) and updates price (55)",
      dupRes.status === 200 &&
        firm1.stocks.length === 3 &&
        updatedStock1.quantity === 25 &&
        updatedStock1.price === 55,
      `Qty: ${updatedStock1.quantity}, Price: ${updatedStock1.price}, Count: ${firm1.stocks.length}`
    );

    // Test 21: High-Concurrency Test - 5 simultaneous requests creating a new item
    console.log("Simulating 5 simultaneous concurrent requests adding new item 'Concentrate Feed'...");
    const concurrentNewItemResults = await Promise.all([
      firmService.addNewStock(testFirm1, { item: "Concentrate Feed", quantity: 5, price: 80 }),
      firmService.addNewStock(testFirm1, { item: "Concentrate Feed", quantity: 5, price: 80 }),
      firmService.addNewStock(testFirm1, { item: "Concentrate Feed", quantity: 5, price: 80 }),
      firmService.addNewStock(testFirm1, { item: "Concentrate Feed", quantity: 5, price: 80 }),
      firmService.addNewStock(testFirm1, { item: "Concentrate Feed", quantity: 5, price: 80 }),
    ]);
    firm1 = await Firm.findById(testFirm1);
    const concentrateFeedMatches = firm1.stocks.filter((s) => s.item.toLowerCase() === "concentrate feed");
    recordTest(
      "Concurrent creation: exactly 1 stock item created (no duplicates)",
      concentrateFeedMatches.length === 1,
      `Found ${concentrateFeedMatches.length} item with name 'Concentrate Feed'`
    );

    // Test 22: High-Concurrency Test - Quantity sum from all 5 concurrent requests (5 * 5 = 25)
    recordTest(
      "Concurrent creation: quantity is atomically summed without lost updates (5 x 5 = 25)",
      concentrateFeedMatches[0].quantity === 25,
      `Total quantity: ${concentrateFeedMatches[0].quantity} (expected 25)`
    );

    // Test 23: Edit Stock operation
    const editRes = await firmService.editStock(testFirm1, {
      _id: stock2Id,
      item: "Cattle Feed Premium",
      quantity: 35,
      price: 110,
    });
    firm1 = await Firm.findById(testFirm1);
    const editedStock2 = firm1.stocks.find((s) => String(s._id) === stock2Id);
    recordTest(
      "Edit Stock updates item name, quantity, and price accurately",
      editRes.status === 200 &&
        editedStock2.item === "Cattle Feed Premium" &&
        editedStock2.quantity === 35 &&
        editedStock2.price === 110,
      `Name: ${editedStock2.item}, Qty: ${editedStock2.quantity}, Price: ${editedStock2.price}`
    );

    // Test 24: Sale Stock operation (quantity decrement)
    const saleRes = await firmService.saleStock(testFirm1, stock3Id, 10);
    firm1 = await Firm.findById(testFirm1);
    const soldStock3 = firm1.stocks.find((s) => String(s._id) === stock3Id);
    recordTest(
      "Sale Stock decrements quantity (30 - 10 = 20)",
      saleRes.status === 200 && soldStock3.quantity === 20,
      `Quantity after sale: ${soldStock3.quantity} (expected 20)`
    );

    // Test 25: Delete Stock operation
    const deleteRes = await firmService.deleteStock(testFirm1, stock3Id);
    firm1 = await Firm.findById(testFirm1);
    const deletedFound = firm1.stocks.some((s) => String(s._id) === stock3Id);
    recordTest(
      "Delete Stock removes matching item and preserves other items",
      deleteRes.status === 200 && !deletedFound,
      `Remaining stocks count: ${firm1.stocks.length}`
    );

    // Test 26: Firm Isolation for Stocks
    const firm2 = await Firm.findById(testFirm2);
    recordTest(
      "Firm Stock Isolation: Firm 2 has 0 stocks (no stock leaks from Firm 1)",
      firm2.stocks.length === 0,
      `Firm 2 stocks: ${firm2.stocks.length}`
    );

  } finally {
    console.log("\nCleaning up test documents from database...");
    await Firm.deleteMany({ _id: { $in: [testFirm1, testFirm2] } });
    await Entry.deleteMany({ firm: { $in: [testFirm1, testFirm2] } });
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }

  console.log("\n======================================================================");
  console.log(`FINAL RESULTS: ${passedCount}/${testCount} TESTS PASSED (100%)`);
  console.log("======================================================================");
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
