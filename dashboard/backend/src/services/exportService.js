import ExcelJS from "exceljs";
import pkgNepaliDate from "nepali-date-converter";
const NepaliDate = pkgNepaliDate.default || pkgNepaliDate;
import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Purchase from "../models/Purchase.js";

export const formatBsDate = (d) => {
  try {
    if (!d) return "";
    const nd = new NepaliDate(new Date(d));
    return nd.format("YYYY-MM-DD");
  } catch {
    return new Date(d).toISOString().slice(0, 10);
  }
};

export const NEPALI_MONTH_NAMES = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

export const NEPALI_MONTH_DEVANAGARI = [
  "बैशाख", "जेठ", "असार", "साउन", "भाद्र", "असोज",
  "कार्तिक", "मंसिर", "पुस", "माघ", "फागुन", "चैत"
];

/**
 * Calculates and returns structured statement data for any given type, month, and year (BS calendar).
 */
export const getStatementData = async (type, month, year) => {
  let dateFilter = {};

  let yNum = parseInt(year, 10);
  if (isNaN(yNum) || yNum < 2070 || yNum > 2100) {
    yNum = new NepaliDate().getYear();
  }

  let periodLabel = "All_Time";
  let mNum = null;

  if (month !== "all") {
    mNum = parseInt(month, 10);
    if (mNum >= 1 && mNum <= 12) {
      const bsStart = new NepaliDate(yNum, mNum - 1, 1).toJsDate();
      bsStart.setHours(0, 0, 0, 0);

      const nextMonth = mNum === 12 ? 1 : mNum + 1;
      const nextYear = mNum === 12 ? yNum + 1 : yNum;
      const bsEnd = new NepaliDate(nextYear, nextMonth - 1, 1).toJsDate();
      bsEnd.setHours(0, 0, 0, 0);

      dateFilter = { date: { $gte: bsStart, $lt: bsEnd } };
      periodLabel = `${NEPALI_MONTH_NAMES[mNum - 1]}_${yNum}_BS`;
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
  const generatedDate = formatBsDate(new Date());

  // Calculations
  const totalSales = sales.reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalPurchases = purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const netProfit = totalSales - totalExpenses - totalPurchases;

  // Breakdown for sales payment methods
  const paymentBreakdown = {
    cash: { amount: 0, count: 0 },
    online_banking: { amount: 0, count: 0 },
    esewa: { amount: 0, count: 0 },
    cheque: { amount: 0, count: 0 },
    other: { amount: 0, count: 0 }
  };
  let highestSale = 0;
  sales.forEach((s) => {
    const amt = Number(s.amount) || 0;
    if (amt > highestSale) highestSale = amt;
    const method = s.paymentMethod?.toLowerCase() || "other";
    if (paymentBreakdown[method]) {
      paymentBreakdown[method].amount += amt;
      paymentBreakdown[method].count += 1;
    } else {
      paymentBreakdown.other.amount += amt;
      paymentBreakdown.other.count += 1;
    }
  });

  // Breakdown for expense categories
  const categoryBreakdown = {
    salary: { amount: 0, count: 0 },
    rent: { amount: 0, count: 0 },
    travel: { amount: 0, count: 0 },
    food: { amount: 0, count: 0 },
    miscellaneous: { amount: 0, count: 0 }
  };
  let highestExpense = 0;
  expenses.forEach((e) => {
    const amt = Number(e.amount) || 0;
    if (amt > highestExpense) highestExpense = amt;
    const cat = e.category?.toLowerCase() || "miscellaneous";
    if (categoryBreakdown[cat]) {
      categoryBreakdown[cat].amount += amt;
      categoryBreakdown[cat].count += 1;
    } else {
      categoryBreakdown.miscellaneous.amount += amt;
      categoryBreakdown.miscellaneous.count += 1;
    }
  });

  // Breakdown for purchase statuses
  const purchaseStatusBreakdown = {
    paid: { amount: 0, count: 0 },
    pending: { amount: 0, count: 0 },
    partial: { amount: 0, count: 0 }
  };
  const uniqueSuppliers = new Set();
  purchases.forEach((p) => {
    const amt = Number(p.amount) || 0;
    if (p.supplier) uniqueSuppliers.add(p.supplier.trim());
    const st = p.status?.toLowerCase() || "pending";
    if (purchaseStatusBreakdown[st]) {
      purchaseStatusBreakdown[st].amount += amt;
      purchaseStatusBreakdown[st].count += 1;
    }
  });

  return {
    type,
    periodLabel,
    cleanPeriodLabel,
    month: mNum,
    year: yNum,
    monthName: mNum ? NEPALI_MONTH_NAMES[mNum - 1] : "All Time",
    monthDevanagari: mNum ? NEPALI_MONTH_DEVANAGARI[mNum - 1] : "",
    generatedDate,
    summary: {
      totalSales,
      totalExpenses,
      totalPurchases,
      netProfit,
      salesCount: sales.length,
      expensesCount: expenses.length,
      purchasesCount: purchases.length,
      highestSale,
      highestExpense,
      averageSale: sales.length > 0 ? Math.round(totalSales / sales.length) : 0,
      averageExpense: expenses.length > 0 ? Math.round(totalExpenses / expenses.length) : 0,
      uniqueSuppliersCount: uniqueSuppliers.size,
      paymentBreakdown,
      categoryBreakdown,
      purchaseStatusBreakdown
    },
    sales: sales.map((s, idx) => ({
      sn: idx + 1,
      id: s._id,
      dateBs: formatBsDate(s.date),
      clientName: s.clientName,
      productName: s.productName,
      paymentMethod: (s.paymentMethod || "cash").toUpperCase(),
      amount: Number(s.amount) || 0,
      notes: s.notes || ""
    })),
    expenses: expenses.map((e, idx) => ({
      sn: idx + 1,
      id: e._id,
      dateBs: formatBsDate(e.date),
      title: e.title,
      category: (e.category || "miscellaneous").toUpperCase(),
      amount: Number(e.amount) || 0,
      description: e.description || ""
    })),
    purchases: purchases.map((p, idx) => ({
      sn: idx + 1,
      id: p._id,
      dateBs: formatBsDate(p.date),
      supplier: p.supplier,
      itemDetails: p.itemDetails,
      status: (p.status || "pending").toUpperCase(),
      amount: Number(p.amount) || 0
    }))
  };
};

/**
 * Builds an ExcelJS Workbook for downloading as CSV or Excel.
 */
export const buildStatementWorkbook = async (type, month, year) => {
  const data = await getStatementData(type, month, year);
  const workbook = new ExcelJS.Workbook();

  const addHeader = (sheet, title) => {
    sheet.addRow(["=========================================================================="]);
    sheet.addRow(["KTM DECOR (P) LTD. - OFFICIAL FINANCIAL STATEMENT"]);
    sheet.addRow(["Balkot, Bhaktapur, Nepal | Phone: +977-9706247439 | Email: info@ktmdecor.com"]);
    sheet.addRow([`DOCUMENT TYPE: ${title.toUpperCase()}`]);
    sheet.addRow([`STATEMENT PERIOD: ${data.cleanPeriodLabel}`]);
    sheet.addRow([`EXPORTED ON (BS): ${data.generatedDate} BS`]);
    sheet.addRow(["CURRENCY: Nepalese Rupee (NPR / Rs.)"]);
    sheet.addRow(["AUDIT STATUS: System Generated Official Record"]);
    sheet.addRow(["=========================================================================="]);
    sheet.addRow([]);
  };

  const addSignOff = (sheet) => {
    sheet.addRow([]);
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["STATEMENT VERIFICATION & AUTHENTICATION"]);
    sheet.addRow(["Prepared By: Finance & Accounts Desk, KTM Decor"]);
    sheet.addRow(["Verified & Authorized By: Managing Director / Authorized Signatory"]);
    sheet.addRow(["Note: This electronic statement is an authentic business record from the KTM Decor Dashboard."]);
    sheet.addRow(["--------------------------------------------------------------------------"]);
  };

  // 1. COMBINED STATEMENT
  if (type === "all") {
    const sheet = workbook.addWorksheet("Combined Statement");
    addHeader(sheet, "Combined Financial Statement");

    // Executive KPI Summary
    sheet.addRow(["EXECUTIVE METRIC SUMMARY", "AMOUNT (Rs.)", "RECORDS COUNT", "NOTES"]);
    sheet.addRow(["Gross Sales Revenue", data.summary.totalSales, data.summary.salesCount, "Total recognized sales"]);
    sheet.addRow(["Total Operating Expenses", data.summary.totalExpenses, data.summary.expensesCount, "Overhead, salaries & bills"]);
    sheet.addRow(["Total Material Purchases", data.summary.totalPurchases, data.summary.purchasesCount, "Raw materials & vendor orders"]);
    sheet.addRow(["NET OPERATING PROFIT / (LOSS)", data.summary.netProfit, data.summary.salesCount + data.summary.expensesCount + data.summary.purchasesCount, "Gross Revenue - Expenses - Purchases"]);
    sheet.addRow([]);

    // Sales Section
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["SECTION 1: SALES & REVENUE LEDGER"]);
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["S.N.", "Date (BS)", "Client Name", "Product / Service", "Payment Method", "Amount (Rs.)", "Notes"]);
    if (data.sales.length > 0) {
      data.sales.forEach((s) => {
        sheet.addRow([s.sn, s.dateBs, s.clientName, s.productName, s.paymentMethod, s.amount, s.notes]);
      });
    } else {
      sheet.addRow(["[NOTICE: No sales transactions were recorded for this period]"]);
      sheet.addRow(["SAMPLE", `${data.year}-04-10`, "Demo Client (Sample)", "3D Acrylic Backlit Sign", "ESEWA", 15000, "Sample entry schema reference"]);
    }
    sheet.addRow(["TOTAL SALES", "", "", "", "", data.summary.totalSales, ""]);
    sheet.addRow([]);

    // Expenses Section
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["SECTION 2: OPERATING OVERHEAD EXPENSES"]);
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["S.N.", "Date (BS)", "Expense Item", "Category", "Amount (Rs.)", "Description"]);
    if (data.expenses.length > 0) {
      data.expenses.forEach((e) => {
        sheet.addRow([e.sn, e.dateBs, e.title, e.category, e.amount, e.description]);
      });
    } else {
      sheet.addRow(["[NOTICE: No operating expenses were recorded for this period]"]);
      sheet.addRow(["SAMPLE", `${data.year}-04-12`, "Workshop Rent & Electricity (Sample)", "RENT", 12000, "Sample entry schema reference"]);
    }
    sheet.addRow(["TOTAL EXPENSES", "", "", "", data.summary.totalExpenses, ""]);
    sheet.addRow([]);

    // Purchases Section
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["SECTION 3: RAW MATERIAL PURCHASES & PROCUREMENT"]);
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["S.N.", "Date (BS)", "Supplier / Vendor", "Item Details", "Status", "Amount (Rs.)"]);
    if (data.purchases.length > 0) {
      data.purchases.forEach((p) => {
        sheet.addRow([p.sn, p.dateBs, p.supplier, p.itemDetails, p.status, p.amount]);
      });
    } else {
      sheet.addRow(["[NOTICE: No material purchases were recorded for this period]"]);
      sheet.addRow(["SAMPLE", `${data.year}-04-05`, "Nepal Acrylic Suppliers (Sample)", "Acrylic Sheets & 12V LED Flex", "PAID", 18500]);
    }
    sheet.addRow(["TOTAL PURCHASES", "", "", "", "", data.summary.totalPurchases]);

    addSignOff(sheet);
  }

  // 2. SALES ONLY STATEMENT
  if (type === "sales") {
    const sheet = workbook.addWorksheet("Sales Statement");
    addHeader(sheet, "Sales & Revenue Statement");

    // KPI Summary
    sheet.addRow(["REVENUE KPI SUMMARY", "VALUE", "NOTES"]);
    sheet.addRow(["Total Sales Revenue", `Rs. ${data.summary.totalSales.toLocaleString()}`, "Gross invoiced amount"]);
    sheet.addRow(["Total Sales Transactions", data.summary.salesCount, "Number of transactions"]);
    sheet.addRow(["Average Transaction Value", `Rs. ${data.summary.averageSale.toLocaleString()}`, "Mean revenue per transaction"]);
    sheet.addRow(["Highest Single Sale", `Rs. ${data.summary.highestSale.toLocaleString()}`, "Max transaction value"]);
    sheet.addRow([]);

    // Payment Method Breakdown Table
    sheet.addRow(["PAYMENT METHOD BREAKDOWN", "COLLECTED (Rs.)", "TRANSACTION COUNT"]);
    sheet.addRow(["Cash", data.summary.paymentBreakdown.cash.amount, data.summary.paymentBreakdown.cash.count]);
    sheet.addRow(["Online Banking / Transfer", data.summary.paymentBreakdown.online_banking.amount, data.summary.paymentBreakdown.online_banking.count]);
    sheet.addRow(["eSewa / Digital Wallet", data.summary.paymentBreakdown.esewa.amount, data.summary.paymentBreakdown.esewa.count]);
    sheet.addRow(["Cheque Payment", data.summary.paymentBreakdown.cheque.amount, data.summary.paymentBreakdown.cheque.count]);
    sheet.addRow(["Other Methods", data.summary.paymentBreakdown.other.amount, data.summary.paymentBreakdown.other.count]);
    sheet.addRow([]);

    // Main Sales Ledger
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["DETAILED SALES TRANSACTIONS"]);
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["S.N.", "Date (BS)", "Client Name", "Product / Service", "Payment Method", "Amount (Rs.)", "Notes"]);

    if (data.sales.length > 0) {
      data.sales.forEach((s) => {
        sheet.addRow([s.sn, s.dateBs, s.clientName, s.productName, s.paymentMethod, s.amount, s.notes]);
      });
    } else {
      sheet.addRow(["[NOTICE: No sales transactions were logged for this period]"]);
      sheet.addRow(["SAMPLE", `${data.year}-04-10`, "Client ABC (Sample)", "Neon Signboard Installation", "ONLINE_BANKING", 25000, "Sample row for schema guidance"]);
    }
    sheet.addRow(["TOTAL REVENUE", "", "", "", "", data.summary.totalSales, ""]);

    addSignOff(sheet);
  }

  // 3. EXPENSES ONLY STATEMENT
  if (type === "expenses") {
    const sheet = workbook.addWorksheet("Expenses Statement");
    addHeader(sheet, "Operating Expenses Log Statement");

    // KPI Summary
    sheet.addRow(["EXPENSES KPI SUMMARY", "VALUE", "NOTES"]);
    sheet.addRow(["Total Operating Overheads", `Rs. ${data.summary.totalExpenses.toLocaleString()}`, "Gross expenses in period"]);
    sheet.addRow(["Total Expense Entries", data.summary.expensesCount, "Number of expense vouchers"]);
    sheet.addRow(["Average Expense per Entry", `Rs. ${data.summary.averageExpense.toLocaleString()}`, "Mean expense value"]);
    sheet.addRow(["Highest Single Expense", `Rs. ${data.summary.highestExpense.toLocaleString()}`, "Max single outflow"]);
    sheet.addRow([]);

    // Category Breakdown Table
    sheet.addRow(["CATEGORY BREAKDOWN", "TOTAL (Rs.)", "ENTRIES COUNT"]);
    sheet.addRow(["Staff Salaries & Payroll", data.summary.categoryBreakdown.salary.amount, data.summary.categoryBreakdown.salary.count]);
    sheet.addRow(["Workshop & Office Rent", data.summary.categoryBreakdown.rent.amount, data.summary.categoryBreakdown.rent.count]);
    sheet.addRow(["Travel & Site Logistics", data.summary.categoryBreakdown.travel.amount, data.summary.categoryBreakdown.travel.count]);
    sheet.addRow(["Food & Refreshment", data.summary.categoryBreakdown.food.amount, data.summary.categoryBreakdown.food.count]);
    sheet.addRow(["Miscellaneous / Overheads", data.summary.categoryBreakdown.miscellaneous.amount, data.summary.categoryBreakdown.miscellaneous.count]);
    sheet.addRow([]);

    // Main Expenses Ledger
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["DETAILED EXPENSES LOG"]);
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["S.N.", "Date (BS)", "Expense Item", "Category", "Amount (Rs.)", "Description"]);

    if (data.expenses.length > 0) {
      data.expenses.forEach((e) => {
        sheet.addRow([e.sn, e.dateBs, e.title, e.category, e.amount, e.description]);
      });
    } else {
      sheet.addRow(["[NOTICE: No expense entries were logged for this period]"]);
      sheet.addRow(["SAMPLE", `${data.year}-04-12`, "Office Internet & Utilities (Sample)", "MISCELLANEOUS", 4200, "Sample row for schema guidance"]);
    }
    sheet.addRow(["TOTAL EXPENSES", "", "", "", data.summary.totalExpenses, ""]);

    addSignOff(sheet);
  }

  // 4. PURCHASES ONLY STATEMENT
  if (type === "purchases") {
    const sheet = workbook.addWorksheet("Purchases Statement");
    addHeader(sheet, "Procurement & Raw Material Purchases Statement");

    // KPI Summary
    sheet.addRow(["PROCUREMENT KPI SUMMARY", "VALUE", "NOTES"]);
    sheet.addRow(["Total Material Procurement", `Rs. ${data.summary.totalPurchases.toLocaleString()}`, "Total supplier purchase invoices"]);
    sheet.addRow(["Total Purchase Invoices", data.summary.purchasesCount, "Number of purchase orders"]);
    sheet.addRow(["Settled Payments (Paid)", `Rs. ${data.summary.purchaseStatusBreakdown.paid.amount.toLocaleString()}`, "Fully paid to vendors"]);
    sheet.addRow(["Outstanding Payables (Pending/Partial)", `Rs. ${(data.summary.purchaseStatusBreakdown.pending.amount + data.summary.purchaseStatusBreakdown.partial.amount).toLocaleString()}`, "Remaining due to suppliers"]);
    sheet.addRow(["Active Suppliers Count", data.summary.uniqueSuppliersCount, "Unique vendors ordered from"]);
    sheet.addRow([]);

    // Status Breakdown Table
    sheet.addRow(["PAYMENT STATUS BREAKDOWN", "TOTAL (Rs.)", "INVOICES COUNT"]);
    sheet.addRow(["Fully Paid", data.summary.purchaseStatusBreakdown.paid.amount, data.summary.purchaseStatusBreakdown.paid.count]);
    sheet.addRow(["Pending Settlement", data.summary.purchaseStatusBreakdown.pending.amount, data.summary.purchaseStatusBreakdown.pending.count]);
    sheet.addRow(["Partially Paid", data.summary.purchaseStatusBreakdown.partial.amount, data.summary.purchaseStatusBreakdown.partial.count]);
    sheet.addRow([]);

    // Main Purchases Ledger
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["DETAILED PURCHASES LEDGER"]);
    sheet.addRow(["--------------------------------------------------------------------------"]);
    sheet.addRow(["S.N.", "Date (BS)", "Supplier / Vendor", "Item Details", "Status", "Amount (Rs.)"]);

    if (data.purchases.length > 0) {
      data.purchases.forEach((p) => {
        sheet.addRow([p.sn, p.dateBs, p.supplier, p.itemDetails, p.status, p.amount]);
      });
    } else {
      sheet.addRow(["[NOTICE: No purchases were logged for this period]"]);
      sheet.addRow(["SAMPLE", `${data.year}-04-05`, "Nepal Acrylic Suppliers (Sample)", "Cast Acrylic Sheets (3mm & 5mm)", "PAID", 18500]);
    }
    sheet.addRow(["TOTAL PURCHASES", "", "", "", "", data.summary.totalPurchases]);

    addSignOff(sheet);
  }

  return { workbook, periodLabel: data.periodLabel };
};
