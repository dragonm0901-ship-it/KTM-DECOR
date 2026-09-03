import ExcelJS from "exceljs";
import pkgNepaliDate from "nepali-date-converter";
const NepaliDate = pkgNepaliDate.default || pkgNepaliDate;
import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Purchase from "../models/Purchase.js";

const formatBsDate = (d) => {
  try {
    if (!d) return "";
    const nd = new NepaliDate(new Date(d));
    return nd.format("YYYY-MM-DD");
  } catch {
    return new Date(d).toISOString().slice(0, 10);
  }
};

export const buildStatementWorkbook = async (type, month, year) => {
  let dateFilter = {};
  
  const nepaliMonthNames = [
    "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
    "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
  ];

  let yNum = parseInt(year, 10);
  if (isNaN(yNum) || yNum < 2070 || yNum > 2100) {
    // Strictly default to current Nepali BS year - no Gregorian calculations
    yNum = new NepaliDate().getYear();
  }

  let periodLabel = "All_Time";

  if (month !== "all") {
    const mNum = parseInt(month, 10);
    if (mNum >= 1 && mNum <= 12) {
      const bsStart = new NepaliDate(yNum, mNum - 1, 1).toJsDate();
      bsStart.setHours(0, 0, 0, 0);

      const nextMonth = mNum === 12 ? 1 : mNum + 1;
      const nextYear = mNum === 12 ? yNum + 1 : yNum;
      const bsEnd = new NepaliDate(nextYear, nextMonth - 1, 1).toJsDate();
      bsEnd.setHours(0, 0, 0, 0);

      dateFilter = { date: { $gte: bsStart, $lt: bsEnd } };
      periodLabel = `${nepaliMonthNames[mNum - 1]}_${yNum}_BS`;
    }
  }

  let sales = [];
  let expenses = [];
  let purchases = [];

  if (type === "all" || type === "sales") {
    sales = await Sale.find(dateFilter).sort({ date: 1 }).lean();
  }
  if (type === "all" || type === "expenses") {
    expenses = await Expense.find(dateFilter).sort({ date: 1 }).lean();
  }
  if (type === "all" || type === "purchases") {
    purchases = await Purchase.find(dateFilter).sort({ date: 1 }).lean();
  }

  const cleanPeriodLabel = periodLabel.replace(/_/g, " ");

  const workbook = new ExcelJS.Workbook();

  if (type === "all") {
    const sheet = workbook.addWorksheet("Combined Statement");
    
    sheet.addRow(["KTM DECOR - COMBINED STATEMENT"]);
    sheet.addRow(["Statement Period:", cleanPeriodLabel]);
    sheet.addRow(["Exported On:", formatBsDate(new Date())]);
    sheet.addRow([]); // Blank row
    
    sheet.addRow(["METRIC SUMMARY", "AMOUNT (Rs.)", "RECORDS COUNT"]);
    
    const totalSales = sales.reduce((sum, s) => sum + s.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPurchases = purchases.reduce((sum, p) => sum + p.amount, 0);
    const netProfit = totalSales - totalExpenses - totalPurchases;
    
    sheet.addRow(["Total Sales Revenue", totalSales, sales.length]);
    sheet.addRow(["Total Expenses Value", totalExpenses, expenses.length]);
    sheet.addRow(["Total Purchases Value", totalPurchases, purchases.length]);
    sheet.addRow(["NET OPERATING PROFIT / (LOSS)", netProfit, ""]);
    sheet.addRow([]); // Blank row
    
    sheet.addRow(["SALES LEDGER"]);
    sheet.addRow(["S.N.", "Date (BS)", "Client Name", "Product", "Payment Method", "Amount (Rs.)", "Notes"]);
    sales.forEach((s, idx) => {
      sheet.addRow([
        idx + 1,
        formatBsDate(s.date),
        s.clientName,
        s.productName,
        s.paymentMethod.toUpperCase(),
        s.amount,
        s.notes || ""
      ]);
    });
    sheet.addRow(["TOTAL", "", "", "", "", totalSales, ""]);
    sheet.addRow([]); // Blank row
    
    sheet.addRow(["EXPENSES LOG"]);
    sheet.addRow(["S.N.", "Date (BS)", "Expense Item", "Category", "Amount (Rs.)", "Description"]);
    expenses.forEach((e, idx) => {
      sheet.addRow([
        idx + 1,
        formatBsDate(e.date),
        e.title,
        e.category.toUpperCase(),
        e.amount,
        e.description || ""
      ]);
    });
    sheet.addRow(["TOTAL", "", "", "", totalExpenses, ""]);
    sheet.addRow([]); // Blank row
    
    sheet.addRow(["PURCHASES LEDGER"]);
    sheet.addRow(["S.N.", "Date (BS)", "Supplier", "Purchase Details", "Status", "Amount (Rs.)"]);
    purchases.forEach((p, idx) => {
      sheet.addRow([
        idx + 1,
        formatBsDate(p.date),
        p.supplier,
        p.itemDetails,
        p.status.toUpperCase(),
        p.amount
      ]);
    });
    sheet.addRow(["TOTAL", "", "", "", "", totalPurchases]);
  }

  if (type === "sales") {
    const salesSheet = workbook.addWorksheet("Sales Ledger");
    salesSheet.columns = [
      { header: "S.N.", key: "sn" },
      { header: "Date (BS)", key: "date" },
      { header: "Client Name", key: "clientName" },
      { header: "Product", key: "productName" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Amount (Rs.)", key: "amount" },
      { header: "Notes", key: "notes" }
    ];

    sales.forEach((s, idx) => {
      salesSheet.addRow({
        sn: idx + 1,
        date: formatBsDate(s.date),
        clientName: s.clientName,
        productName: s.productName,
        paymentMethod: s.paymentMethod.toUpperCase(),
        amount: s.amount,
        notes: s.notes || ""
      });
    });

    const totalAmount = sales.reduce((sum, s) => sum + s.amount, 0);
    salesSheet.addRow({
      sn: "TOTAL",
      date: "",
      clientName: "",
      productName: "",
      paymentMethod: "",
      amount: totalAmount,
      notes: ""
    });
  }

  if (type === "expenses") {
    const expensesSheet = workbook.addWorksheet("Expenses Log");
    expensesSheet.columns = [
      { header: "S.N.", key: "sn" },
      { header: "Date (BS)", key: "date" },
      { header: "Expense Item", key: "title" },
      { header: "Category", key: "category" },
      { header: "Amount (Rs.)", key: "amount" },
      { header: "Description", key: "description" }
    ];

    expenses.forEach((e, idx) => {
      expensesSheet.addRow({
        sn: idx + 1,
        date: formatBsDate(e.date),
        title: e.title,
        category: e.category.toUpperCase(),
        amount: e.amount,
        description: e.description || ""
      });
    });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
    expensesSheet.addRow({
      sn: "TOTAL",
      date: "",
      title: "",
      category: "",
      amount: totalAmount,
      description: ""
    });
  }

  if (type === "purchases") {
    const purchasesSheet = workbook.addWorksheet("Purchases Ledger");
    purchasesSheet.columns = [
      { header: "S.N.", key: "sn" },
      { header: "Date (BS)", key: "date" },
      { header: "Supplier", key: "supplier" },
      { header: "Purchase Details", key: "details" },
      { header: "Status", key: "status" },
      { header: "Amount (Rs.)", key: "amount" }
    ];

    purchases.forEach((p, idx) => {
      purchasesSheet.addRow({
        sn: idx + 1,
        date: formatBsDate(p.date),
        supplier: p.supplier,
        details: p.itemDetails,
        status: p.status.toUpperCase(),
        amount: p.amount
      });
    });

    const totalAmount = purchases.reduce((sum, p) => sum + p.amount, 0);
    purchasesSheet.addRow({
      sn: "TOTAL",
      date: "",
      supplier: "",
      details: "",
      status: "",
      amount: totalAmount
    });
  }

  return { workbook, periodLabel };
};
