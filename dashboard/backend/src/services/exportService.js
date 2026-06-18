import ExcelJS from "exceljs";
import Sale from "../models/Sale.js";
import Expense from "../models/Expense.js";
import Purchase from "../models/Purchase.js";

export const buildStatementWorkbook = async (type, month, year) => {
  let dateFilter = {};
  
  if (month !== "all") {
    const mNum = parseInt(month, 10);
    const yNum = parseInt(year, 10);
    const startOfMonth = new Date(Date.UTC(yNum, mNum - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(yNum, mNum, 0, 23, 59, 59, 999));
    dateFilter = { date: { $gte: startOfMonth, $lte: endOfMonth } };
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const periodLabel = month === "all" ? "All_Time" : `${monthNames[parseInt(month, 10) - 1]}_${year}`;
  const cleanPeriodLabel = periodLabel.replace(/_/g, " ");

  const workbook = new ExcelJS.Workbook();

  if (type === "all") {
    const sheet = workbook.addWorksheet("Combined Statement");
    
    sheet.addRow(["KTM DECOR - COMBINED STATEMENT"]);
    sheet.addRow(["Statement Period:", cleanPeriodLabel]);
    sheet.addRow(["Exported On:", new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString()]);
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
    sheet.addRow(["S.N.", "Date", "Client Name", "Product", "Payment Method", "Amount (Rs.)", "Notes"]);
    sales.forEach((s, idx) => {
      sheet.addRow([
        idx + 1,
        new Date(s.date).toLocaleDateString(),
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
    sheet.addRow(["S.N.", "Date", "Expense Item", "Category", "Amount (Rs.)", "Description"]);
    expenses.forEach((e, idx) => {
      sheet.addRow([
        idx + 1,
        new Date(e.date).toLocaleDateString(),
        e.title,
        e.category.toUpperCase(),
        e.amount,
        e.description || ""
      ]);
    });
    sheet.addRow(["TOTAL", "", "", "", totalExpenses, ""]);
    sheet.addRow([]); // Blank row
    
    sheet.addRow(["PURCHASES LEDGER"]);
    sheet.addRow(["S.N.", "Date", "Supplier", "Purchase Details", "Status", "Amount (Rs.)"]);
    purchases.forEach((p, idx) => {
      sheet.addRow([
        idx + 1,
        new Date(p.date).toLocaleDateString(),
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
      { header: "Date", key: "date" },
      { header: "Client Name", key: "clientName" },
      { header: "Product", key: "productName" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Amount (Rs.)", key: "amount" },
      { header: "Notes", key: "notes" }
    ];

    sales.forEach((s, idx) => {
      salesSheet.addRow({
        sn: idx + 1,
        date: new Date(s.date).toLocaleDateString(),
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
      { header: "Date", key: "date" },
      { header: "Expense Item", key: "title" },
      { header: "Category", key: "category" },
      { header: "Amount (Rs.)", key: "amount" },
      { header: "Description", key: "description" }
    ];

    expenses.forEach((e, idx) => {
      expensesSheet.addRow({
        sn: idx + 1,
        date: new Date(e.date).toLocaleDateString(),
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
      { header: "Date", key: "date" },
      { header: "Supplier", key: "supplier" },
      { header: "Purchase Details", key: "details" },
      { header: "Status", key: "status" },
      { header: "Amount (Rs.)", key: "amount" }
    ];

    purchases.forEach((p, idx) => {
      purchasesSheet.addRow({
        sn: idx + 1,
        date: new Date(p.date).toLocaleDateString(),
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
