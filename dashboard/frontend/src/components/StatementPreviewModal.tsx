import React from "react";
import { Download, X, Printer } from "lucide-react";
import { FileText, Calendar } from "./ui/solar-icons";

interface StatementPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  loading?: boolean;
  onDownloadCsv?: () => void;
}

export const StatementPreviewModal: React.FC<StatementPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  loading = false,
  onDownloadCsv,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getDocTitle = (type: string) => {
    switch (type) {
      case "sales":
        return "Official Sales & Revenue Statement";
      case "expenses":
        return "Official Operating Expenses Statement";
      case "purchases":
        return "Official Material Purchases & Procurement Statement";
      case "all":
      default:
        return "Official Combined Financial Statement";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      {/* Print styles override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #statement-print-area, #statement-print-area * {
            visibility: visible !important;
          }
          #statement-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
            border: none !important;
          }
          .screen-only {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>

      <div className="bg-card w-full max-w-4xl rounded-2xl border border-border/80 shadow-2xl animate-scale-up my-4 max-h-[calc(100dvh-32px)] sm:max-h-[95vh] flex flex-col overflow-hidden">
        {/* Modal Controls (Screen Only) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md screen-only">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {data ? getDocTitle(data.type) : "Financial Statement Preview"}
              </h2>
              <p className="text-[11px] text-muted">
                {data ? `Period: ${data.cleanPeriodLabel} (BS)` : "Loading statement..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDownloadCsv && (
              <button
                onClick={onDownloadCsv}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-border bg-background hover:bg-accent/[0.05] hover:border-accent/30 text-xs font-semibold text-foreground transition-colors"
                title="Download CSV file"
              >
                <Download size={14} className="text-accent" />
                <span>CSV</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              disabled={loading || !data}
              className="flex items-center gap-1.5 py-1.5 px-4 bg-[#FE914C] hover:bg-[#E2752D] text-white rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Printer size={14} />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-muted hover:text-foreground rounded-lg hover:bg-muted/10 transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body / Scroll Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-background/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold">Preparing statement document...</p>
            </div>
          ) : !data ? (
            <div className="text-center py-20 text-muted">
              <p className="text-sm font-semibold">Failed to load statement data.</p>
            </div>
          ) : (
            /* PRINTABLE DOCUMENT AREA */
            <div
              id="statement-print-area"
              className="bg-white text-gray-900 p-6 sm:p-10 rounded-xl border border-gray-300 font-sans text-left shadow-sm select-text space-y-6"
            >
              {/* Official Letterhead */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-gray-900 pb-5 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-gray-950 font-display">
                      KTM DECOR (P) LTD.
                    </h1>
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-1">
                    Signage Fabrication · Custom Neon & Backlit Branding Solutions
                  </p>
                  <p className="text-[11px] text-gray-600 mt-1">
                    Balkot, Bhaktapur, Nepal &nbsp;•&nbsp; Phone: +977-9706247439 &nbsp;•&nbsp; Email: info@ktmdecor.com
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <img
                    src="/admin/logo/ktm%20decor.svg"
                    alt="KTM Decor Logo"
                    className="h-16 w-auto object-contain mb-1"
                  />
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-300">
                    Official Statement
                  </span>
                </div>
              </div>

              {/* Title & Period Banner */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-black text-gray-950 uppercase tracking-wide">
                    {getDocTitle(data.type)}
                  </h2>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Authentic Financial Accounting Record &nbsp;•&nbsp; Bikram Sambat (BS) Calendar
                  </p>
                </div>

                <div className="flex flex-col sm:items-end text-xs">
                  <div className="flex items-center gap-1 font-bold text-gray-900">
                    <Calendar size={13} className="text-[#FE914C]" />
                    <span>Period: {data.cleanPeriodLabel}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 mt-0.5">
                    Date of Issue: {data.generatedDate} BS
                  </span>
                </div>
              </div>

              {/* Executive KPI Summary Cards */}
              {data.type === "all" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Total Sales Revenue
                    </span>
                    <span className="text-base font-black text-emerald-700 mt-1 block">
                      Rs. {data.summary.totalSales.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500">{data.summary.salesCount} transactions</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Operating Expenses
                    </span>
                    <span className="text-base font-black text-red-700 mt-1 block">
                      Rs. {data.summary.totalExpenses.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500">{data.summary.expensesCount} vouchers</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Material Purchases
                    </span>
                    <span className="text-base font-black text-amber-700 mt-1 block">
                      Rs. {data.summary.totalPurchases.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500">{data.summary.purchasesCount} orders</span>
                  </div>

                  <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Net Operating Margin
                    </span>
                    <span
                      className={`text-base font-black mt-1 block ${
                        data.summary.netProfit >= 0 ? "text-emerald-800" : "text-red-800"
                      }`}
                    >
                      Rs. {data.summary.netProfit.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {data.summary.netProfit >= 0 ? "Operating Surplus" : "Operating Deficit"}
                    </span>
                  </div>
                </div>
              )}

              {data.type === "sales" && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="p-3.5 rounded-lg border border-gray-200 bg-emerald-50/40">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Total Sales
                      </span>
                      <span className="text-lg font-black text-emerald-700 mt-1 block">
                        Rs. {data.summary.totalSales.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Total Invoices
                      </span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">
                        {data.summary.salesCount}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Average Sale
                      </span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">
                        Rs. {data.summary.averageSale.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Highest Transaction
                      </span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">
                        Rs. {data.summary.highestSale.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Payment Methods breakdown chips */}
                  <div className="flex flex-wrap gap-2 text-[11px] bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-700 mr-1">Payment Breakdown:</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Cash: Rs. {data.summary.paymentBreakdown.cash.amount.toLocaleString()} ({data.summary.paymentBreakdown.cash.count})
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      eSewa: Rs. {data.summary.paymentBreakdown.esewa.amount.toLocaleString()} ({data.summary.paymentBreakdown.esewa.count})
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Online: Rs. {data.summary.paymentBreakdown.online_banking.amount.toLocaleString()} ({data.summary.paymentBreakdown.online_banking.count})
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Cheque: Rs. {data.summary.paymentBreakdown.cheque.amount.toLocaleString()} ({data.summary.paymentBreakdown.cheque.count})
                    </span>
                  </div>
                </div>
              )}

              {data.type === "expenses" && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="p-3.5 rounded-lg border border-gray-200 bg-red-50/40">
                      <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider block">
                        Total Overheads
                      </span>
                      <span className="text-lg font-black text-red-700 mt-1 block">
                        Rs. {data.summary.totalExpenses.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Expense Entries
                      </span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">
                        {data.summary.expensesCount}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Average Outflow
                      </span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">
                        Rs. {data.summary.averageExpense.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Highest Outflow
                      </span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">
                        Rs. {data.summary.highestExpense.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Category breakdown chips */}
                  <div className="flex flex-wrap gap-2 text-[11px] bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-700 mr-1">Category Breakdown:</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Salary: Rs. {data.summary.categoryBreakdown.salary.amount.toLocaleString()} ({data.summary.categoryBreakdown.salary.count})
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Rent: Rs. {data.summary.categoryBreakdown.rent.amount.toLocaleString()} ({data.summary.categoryBreakdown.rent.count})
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Travel: Rs. {data.summary.categoryBreakdown.travel.amount.toLocaleString()} ({data.summary.categoryBreakdown.travel.count})
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Food: Rs. {data.summary.categoryBreakdown.food.amount.toLocaleString()} ({data.summary.categoryBreakdown.food.count})
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Misc: Rs. {data.summary.categoryBreakdown.miscellaneous.amount.toLocaleString()} ({data.summary.categoryBreakdown.miscellaneous.count})
                    </span>
                  </div>
                </div>
              )}

              {data.type === "purchases" && (
                <div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                    <div className="p-3.5 rounded-lg border border-gray-200 bg-amber-50/40">
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                        Total Procurement
                      </span>
                      <span className="text-lg font-black text-amber-700 mt-1 block">
                        Rs. {data.summary.totalPurchases.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Purchase Invoices
                      </span>
                      <span className="text-lg font-black text-gray-900 mt-1 block">
                        {data.summary.purchasesCount}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Settled (Paid)
                      </span>
                      <span className="text-lg font-black text-emerald-700 mt-1 block">
                        Rs. {data.summary.purchaseStatusBreakdown.paid.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                        Pending Payables
                      </span>
                      <span className="text-lg font-black text-red-700 mt-1 block">
                        Rs. {(data.summary.purchaseStatusBreakdown.pending.amount + data.summary.purchaseStatusBreakdown.partial.amount).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <span className="font-bold text-gray-700 mr-1">Suppliers & Status:</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Unique Vendors: {data.summary.uniqueSuppliersCount}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Paid: {data.summary.purchaseStatusBreakdown.paid.count}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700">
                      Pending: {data.summary.purchaseStatusBreakdown.pending.count}
                    </span>
                  </div>
                </div>
              )}

              {/* SALES LEDGER TABLE */}
              {(data.type === "all" || data.type === "sales") && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-between border-b border-gray-300 pb-1.5">
                    <span>Sales & Revenue Transactions</span>
                    <span className="text-[11px] font-bold text-emerald-700">
                      Total: Rs. {data.summary.totalSales.toLocaleString()}
                    </span>
                  </h3>

                  {data.sales.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 font-bold">
                          <th className="py-2 px-2.5 w-10 text-center">S.N.</th>
                          <th className="py-2 px-2.5 w-24">Date (BS)</th>
                          <th className="py-2 px-2.5">Client Name</th>
                          <th className="py-2 px-2.5">Product / Project</th>
                          <th className="py-2 px-2.5 w-24 text-center">Method</th>
                          <th className="py-2 px-2.5 text-right w-28">Amount (Rs.)</th>
                          <th className="py-2 px-2.5 text-gray-500">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {data.sales.map((s: any) => (
                          <tr key={s.id || s.sn} className="hover:bg-gray-50/80">
                            <td className="py-2 px-2.5 text-center text-gray-500 font-medium">{s.sn}</td>
                            <td className="py-2 px-2.5 font-semibold text-gray-900">{s.dateBs}</td>
                            <td className="py-2 px-2.5 font-bold text-gray-950">{s.clientName}</td>
                            <td className="py-2 px-2.5 text-gray-700">{s.productName}</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                                {s.paymentMethod}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-right font-black text-emerald-700">
                              Rs. {s.amount.toLocaleString()}
                            </td>
                            <td className="py-2 px-2.5 text-[11px] text-gray-500 truncate max-w-[140px]">{s.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    /* Sample schema reference row when empty */
                    <div className="border border-dashed border-gray-300 rounded-lg p-3.5 bg-gray-50/80 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 font-bold mb-1">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-[10px]">NOTICE</span>
                        <span>No sales recorded during this period.</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-2">
                        Below is the standard record schema preview for sales transactions in this statement:
                      </p>
                      <div className="bg-white border border-gray-200 rounded p-2 text-[11px] text-gray-600 font-mono flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong>S.N.:</strong> 1</span>
                        <span><strong>Date:</strong> 2083-04-10 BS</span>
                        <span><strong>Client:</strong> Demo Client (Sample)</span>
                        <span><strong>Product:</strong> 3D Acrylic Backlit Sign</span>
                        <span><strong>Method:</strong> ESEWA</span>
                        <span><strong>Amount:</strong> Rs. 15,000</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EXPENSES LOG TABLE */}
              {(data.type === "all" || data.type === "expenses") && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-between border-b border-gray-300 pb-1.5">
                    <span>Operating Overhead Expenses</span>
                    <span className="text-[11px] font-bold text-red-700">
                      Total: Rs. {data.summary.totalExpenses.toLocaleString()}
                    </span>
                  </h3>

                  {data.expenses.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 font-bold">
                          <th className="py-2 px-2.5 w-10 text-center">S.N.</th>
                          <th className="py-2 px-2.5 w-24">Date (BS)</th>
                          <th className="py-2 px-2.5">Expense Item</th>
                          <th className="py-2 px-2.5 w-28 text-center">Category</th>
                          <th className="py-2 px-2.5 text-right w-28">Amount (Rs.)</th>
                          <th className="py-2 px-2.5 text-gray-500">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {data.expenses.map((e: any) => (
                          <tr key={e.id || e.sn} className="hover:bg-gray-50/80">
                            <td className="py-2 px-2.5 text-center text-gray-500 font-medium">{e.sn}</td>
                            <td className="py-2 px-2.5 font-semibold text-gray-900">{e.dateBs}</td>
                            <td className="py-2 px-2.5 font-bold text-gray-950">{e.title}</td>
                            <td className="py-2 px-2.5 text-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200">
                                {e.category}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-right font-black text-red-700">
                              Rs. {e.amount.toLocaleString()}
                            </td>
                            <td className="py-2 px-2.5 text-[11px] text-gray-500 truncate max-w-[180px]">{e.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-lg p-3.5 bg-gray-50/80 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 font-bold mb-1">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-[10px]">NOTICE</span>
                        <span>No operating expenses recorded during this period.</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-2">
                        Below is the standard record schema preview for expense entries in this statement:
                      </p>
                      <div className="bg-white border border-gray-200 rounded p-2 text-[11px] text-gray-600 font-mono flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong>S.N.:</strong> 1</span>
                        <span><strong>Date:</strong> 2083-04-12 BS</span>
                        <span><strong>Expense Item:</strong> Workshop Electricity & Rent (Sample)</span>
                        <span><strong>Category:</strong> RENT</span>
                        <span><strong>Amount:</strong> Rs. 12,000</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PURCHASES TRACKER TABLE */}
              {(data.type === "all" || data.type === "purchases") && (
                <div className="space-y-2">
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-between border-b border-gray-300 pb-1.5">
                    <span>Raw Material Purchases & Procurement</span>
                    <span className="text-[11px] font-bold text-amber-700">
                      Total: Rs. {data.summary.totalPurchases.toLocaleString()}
                    </span>
                  </h3>

                  {data.purchases.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 border-b border-gray-300 font-bold">
                          <th className="py-2 px-2.5 w-10 text-center">S.N.</th>
                          <th className="py-2 px-2.5 w-24">Date (BS)</th>
                          <th className="py-2 px-2.5">Supplier / Vendor</th>
                          <th className="py-2 px-2.5">Item Details</th>
                          <th className="py-2 px-2.5 w-24 text-center">Status</th>
                          <th className="py-2 px-2.5 text-right w-28">Amount (Rs.)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {data.purchases.map((p: any) => (
                          <tr key={p.id || p.sn} className="hover:bg-gray-50/80">
                            <td className="py-2 px-2.5 text-center text-gray-500 font-medium">{p.sn}</td>
                            <td className="py-2 px-2.5 font-semibold text-gray-900">{p.dateBs}</td>
                            <td className="py-2 px-2.5 font-bold text-gray-950">{p.supplier}</td>
                            <td className="py-2 px-2.5 text-gray-700">{p.itemDetails}</td>
                            <td className="py-2 px-2.5 text-center">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  p.status === "PAID"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                    : "bg-amber-50 text-amber-800 border-amber-300"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-right font-black text-amber-700">
                              Rs. {p.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="border border-dashed border-gray-300 rounded-lg p-3.5 bg-gray-50/80 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 font-bold mb-1">
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-[10px]">NOTICE</span>
                        <span>No raw material purchases recorded during this period.</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-2">
                        Below is the standard record schema preview for procurement entries in this statement:
                      </p>
                      <div className="bg-white border border-gray-200 rounded p-2 text-[11px] text-gray-600 font-mono flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong>S.N.:</strong> 1</span>
                        <span><strong>Date:</strong> 2083-04-05 BS</span>
                        <span><strong>Supplier:</strong> Nepal Acrylic Suppliers (Sample)</span>
                        <span><strong>Item:</strong> Cast Acrylic Sheets & LED Flex</span>
                        <span><strong>Status:</strong> PAID</span>
                        <span><strong>Amount:</strong> Rs. 18,500</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Official Sign-off & Verification Footer */}
              <div className="pt-8 border-t border-gray-300 grid grid-cols-2 gap-8 text-xs text-gray-700">
                <div>
                  <div className="border-b border-gray-400 w-48 mb-2" />
                  <p className="font-bold text-gray-900">Prepared By:</p>
                  <p className="text-[11px] text-gray-600">Finance & Administration Desk, KTM Decor</p>
                </div>

                <div className="flex flex-col items-end text-right">
                  <div className="border-b border-gray-400 w-48 mb-2" />
                  <p className="font-bold text-gray-900">Verified & Approved By:</p>
                  <p className="text-[11px] text-gray-600">Managing Director / Authorized Signatory</p>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="pt-2 text-[10px] text-center text-gray-400 border-t border-gray-100">
                This is a certified electronic statement generated by KTM Decor Dashboard ERP. Valid without manual signature when issued electronically.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
