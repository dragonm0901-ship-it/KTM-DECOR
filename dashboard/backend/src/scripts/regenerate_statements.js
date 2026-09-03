import mongoose from "mongoose";
import pkgNepaliDate from "nepali-date-converter";
const NepaliDate = pkgNepaliDate.default || pkgNepaliDate;

import MonthlyStatement from "../models/MonthlyStatement.js";
import { buildStatementWorkbook } from "../services/exportService.js";

const NEPALI_MONTH_NAMES = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

function getPreviousNepaliMonthAndYear(offsetMonths = 1) {
  const nd = new NepaliDate();
  let mIdx = nd.getMonth();
  let year = nd.getYear();

  for (let i = 0; i < offsetMonths; i++) {
    if (mIdx === 0) {
      mIdx = 11;
      year -= 1;
    } else {
      mIdx -= 1;
    }
  }
  return { month: mIdx + 1, year };
}

async function run() {
  await mongoose.connect("mongodb://localhost:27017/ktm_decor_dashboard");
  console.log("Connected to MongoDB.");

  // Clean up old Gregorian statements (year < 2070)
  const delResult = await MonthlyStatement.deleteMany({ year: { $lt: 2070 } });
  console.log(`Deleted ${delResult.deletedCount} Gregorian calendar statements.`);

  const types = ["sales", "expenses", "purchases", "all"];
  for (let offset = 1; offset <= 4; offset++) {
    const { month, year } = getPreviousNepaliMonthAndYear(offset);
    const monthLabel = NEPALI_MONTH_NAMES[month - 1];

    for (const type of types) {
      const exists = await MonthlyStatement.findOne({ month, year, type });
      if (!exists) {
        const { workbook } = await buildStatementWorkbook(type, month.toString(), year.toString());
        const csvBuffer = await workbook.csv.writeBuffer();
        const csvText = csvBuffer.toString("utf-8");
        const prefix = type === "all" ? "combined" : type;
        const filename = `${prefix}_statement_${monthLabel}_${year}_BS.csv`;

        await MonthlyStatement.create({
          month,
          year,
          type,
          filename,
          content: csvText
        });
        console.log(`Generated: ${filename}`);
      } else {
        console.log(`Already exists: ${exists.filename}`);
      }
    }
  }

  const allArchives = await MonthlyStatement.find({}).sort({ year: -1, month: -1, type: 1 });
  console.log(`\nTotal active archives in DB: ${allArchives.length}`);
  allArchives.forEach((a) => {
    console.log(`- [${a.type}] ${a.filename}`);
  });

  await mongoose.disconnect();
  console.log("Migration completed.");
}

run().catch((e) => {
  console.error("Migration error:", e);
  process.exit(1);
});
