import React from "react";
import { createPortal } from "react-dom";
import { Download, X, Printer, CheckCircle2 } from "lucide-react";
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
    const originalTitle = document.title;
    document.title = "";
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
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

  const statementRefNumber = data
    ? `KTM-STMT-${data.type?.toUpperCase() || "FIN"}-${(data.year || 2083)}-${data.month ? String(data.month).padStart(2, "0") : "ALL"}`
    : "KTM-STMT";

  return createPortal(
    <div className="statement-modal-portal">
      {/* Print styles override strictly adhering to CSS Paged Media module */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 0 !important; /* SUPPRESSES BROWSER AUTOMATIC HEADER (DATE, TITLE) & FOOTER (URL, 1/1) */
        }

        @media print {
          /* 1. Hide the entire screen application root */
          #root, #__next {
            display: none !important;
          }

          /* 2. Unconstrain HTML & BODY */
          html, body {
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* 3. Convert modal wrappers to static, natural document flow */
          .statement-modal-portal {
            display: block !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          .statement-modal-overlay {
            position: static !important;
            inset: auto !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            backdrop-filter: none !important;
            z-index: auto !important;
          }

          .statement-modal-card {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .statement-modal-scroll {
            position: static !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
          }

          /* 4. Hide screen navigation, close buttons, and toolbars */
          .screen-only,
          .statement-screen-controls {
            display: none !important;
          }

          /* 5. Statement printable container */
          #statement-print-area {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            padding: 12mm 14mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          /* 6. Multi-page table pagination rules */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
          }

          thead {
            display: table-header-group !important; /* CRITICAL: Repeats column headers across every A4 page */
          }

          tfoot {
            display: table-footer-group !important;
          }

          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important; /* Prevents rows from being sliced in half across pages */
          }

          td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            break-after: avoid !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      {/* Screen Overlay (Converts to static transparent container during print) */}
      <div className="statement-modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
        <div className="statement-modal-card bg-card w-full max-w-4xl rounded-[28px] border border-border/80 shadow-2xl animate-scale-up my-4 max-h-[calc(100dvh-32px)] sm:max-h-[95vh] flex flex-col overflow-hidden">
          {/* Modal Controls (Screen Only) */}
          <div className="statement-screen-controls flex items-center justify-between px-6 py-4 border-b border-border/60 bg-card/80 backdrop-blur-md screen-only">
            <div className="flex items-center gap-3">
              <div
                style={{ background: "linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)" }}
                className="p-2 text-white rounded-xl shadow-xs shrink-0"
              >
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground">
                  {data ? getDocTitle(data.type) : "Financial Statement Preview"}
                </h2>
                <p className="text-[11px] text-muted font-medium">
                  {data ? `Period: ${data.cleanPeriodLabel} (BS)` : "Loading statement..."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onDownloadCsv && (
                <button
                  onClick={onDownloadCsv}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl border border-border/80 bg-background hover:bg-muted/20 text-xs font-bold text-foreground transition-all shadow-2xs"
                  title="Download CSV file"
                >
                  <Download size={14} className="text-accent" />
                  <span>CSV</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                disabled={loading || !data}
                style={{ background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)" }}
                className="flex items-center gap-1.5 py-1.5 px-4 text-black rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/15 active:scale-95 disabled:opacity-50 hover:opacity-95 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print / Save PDF (A4)</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-muted hover:text-foreground rounded-xl hover:bg-muted/20 transition-all ml-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body / Scroll Area */}
          <div className="statement-modal-scroll p-4 sm:p-6 overflow-y-auto flex-1 bg-background/50">
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
                className="bg-white text-gray-950 p-6 sm:p-10 rounded-xl border border-gray-300 font-sans text-left shadow-sm select-text space-y-6"
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
                    <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                      PAN / Reg No: 618492041 &nbsp;•&nbsp; Ref: <span className="font-mono font-bold text-gray-800">{statementRefNumber}</span>
                    </p>
                  </div>

                  <div className="flex flex-col items-end">
                    <img
                      src="/admin/logo/ktm%20decor.svg"
                      alt="KTM Decor Logo"
                      className="h-14 w-auto object-contain mb-1"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-300">
                        Certified Official Statement
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & Period Banner */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-gray-950 uppercase tracking-wide">
                      {getDocTitle(data.type)}
                    </h2>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Financial Accounting & Audit Ledger &nbsp;•&nbsp; Bikram Sambat (BS) Calendar
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                      <Calendar size={13} className="text-[#FE914C]" />
                      <span>Accounting Period: {data.cleanPeriodLabel}</span>
                    </div>
                    <span className="text-[11px] text-gray-500 mt-0.5">
                      Date of Issue: {data.generatedDate} BS
                    </span>
                  </div>
                </div>

                {/* Executive KPI Summary Cards */}
                {data.type === "all" && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 avoid-break">
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
                  <div className="avoid-break">
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
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Cash: Rs. {data.summary.paymentBreakdown?.cash?.amount?.toLocaleString() || 0} ({data.summary.paymentBreakdown?.cash?.count || 0})
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        eSewa: Rs. {data.summary.paymentBreakdown?.esewa?.amount?.toLocaleString() || 0} ({data.summary.paymentBreakdown?.esewa?.count || 0})
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Online: Rs. {data.summary.paymentBreakdown?.online_banking?.amount?.toLocaleString() || 0} ({data.summary.paymentBreakdown?.online_banking?.count || 0})
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Cheque: Rs. {data.summary.paymentBreakdown?.cheque?.amount?.toLocaleString() || 0} ({data.summary.paymentBreakdown?.cheque?.count || 0})
                      </span>
                    </div>
                  </div>
                )}

                {data.type === "expenses" && (
                  <div className="avoid-break">
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
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Salary: Rs. {data.summary.categoryBreakdown?.salary?.amount?.toLocaleString() || 0} ({data.summary.categoryBreakdown?.salary?.count || 0})
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Rent: Rs. {data.summary.categoryBreakdown?.rent?.amount?.toLocaleString() || 0} ({data.summary.categoryBreakdown?.rent?.count || 0})
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Travel: Rs. {data.summary.categoryBreakdown?.travel?.amount?.toLocaleString() || 0} ({data.summary.categoryBreakdown?.travel?.count || 0})
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Food: Rs. {data.summary.categoryBreakdown?.food?.amount?.toLocaleString() || 0} ({data.summary.categoryBreakdown?.food?.count || 0})
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Misc: Rs. {data.summary.categoryBreakdown?.miscellaneous?.amount?.toLocaleString() || 0} ({data.summary.categoryBreakdown?.miscellaneous?.count || 0})
                      </span>
                    </div>
                  </div>
                )}

                {data.type === "purchases" && (
                  <div className="avoid-break">
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
                          Rs. {data.summary.purchaseStatusBreakdown?.paid?.amount?.toLocaleString() || 0}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/50">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                          Pending Payables
                        </span>
                        <span className="text-lg font-black text-red-700 mt-1 block">
                          Rs. {(
                            (data.summary.purchaseStatusBreakdown?.pending?.amount || 0) +
                            (data.summary.purchaseStatusBreakdown?.partial?.amount || 0)
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-[11px] bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <span className="font-bold text-gray-700 mr-1">Suppliers & Status:</span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Unique Vendors: {data.summary.uniqueSuppliersCount || 0}
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Paid Invoices: {data.summary.purchaseStatusBreakdown?.paid?.count || 0}
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-700 font-medium">
                        Pending Invoices: {data.summary.purchaseStatusBreakdown?.pending?.count || 0}
                      </span>
                    </div>
                  </div>
                )}

                {/* SALES LEDGER TABLE */}
                {(data.type === "all" || data.type === "sales") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b-2 border-gray-800 pb-1.5 avoid-break">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Sales & Revenue Ledger Transactions
                      </h3>
                      <span className="text-xs font-black text-emerald-700">
                        Total: Rs. {data.summary.totalSales.toLocaleString()}
                      </span>
                    </div>

                    {data.sales && data.sales.length > 0 ? (
                      <table className="w-full text-left text-xs border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100 text-gray-800 border-b border-gray-300 font-bold text-[11px]">
                            <th className="py-2.5 px-2.5 w-10 text-center border-r border-gray-300">S.N.</th>
                            <th className="py-2.5 px-2.5 w-24 border-r border-gray-300">Date (BS)</th>
                            <th className="py-2.5 px-2.5 border-r border-gray-300">Client Name</th>
                            <th className="py-2.5 px-2.5 border-r border-gray-300">Product / Project</th>
                            <th className="py-2.5 px-2.5 w-24 text-center border-r border-gray-300">Payment</th>
                            <th className="py-2.5 px-2.5 text-right w-28 border-r border-gray-300">Amount (Rs.)</th>
                            <th className="py-2.5 px-2.5 text-gray-600">Notes / Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {data.sales.map((s: any, idx: number) => (
                            <tr
                              key={s.id || s.sn || idx}
                              className={idx % 2 === 1 ? "bg-gray-50/70" : "bg-white"}
                            >
                              <td className="py-2 px-2.5 text-center text-gray-500 font-medium border-r border-gray-200">
                                {s.sn || idx + 1}
                              </td>
                              <td className="py-2 px-2.5 font-semibold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                                {s.dateBs}
                              </td>
                              <td className="py-2 px-2.5 font-bold text-gray-950 border-r border-gray-200">
                                {s.clientName}
                              </td>
                              <td className="py-2 px-2.5 text-gray-700 border-r border-gray-200">
                                {s.productName}
                              </td>
                              <td className="py-2 px-2.5 text-center border-r border-gray-200">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200 uppercase">
                                  {s.paymentMethod}
                                </span>
                              </td>
                              <td className="py-2 px-2.5 text-right font-black text-emerald-700 border-r border-gray-200 whitespace-nowrap">
                                Rs. {s.amount.toLocaleString()}
                              </td>
                              <td className="py-2 px-2.5 text-[11px] text-gray-600">
                                {s.notes || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 text-gray-950 font-bold border-t-2 border-gray-900 text-xs">
                            <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider font-extrabold border-r border-gray-300">
                              Total Sales Revenue ({data.sales.length} transactions):
                            </td>
                            <td className="py-2.5 px-2.5 text-right font-black text-emerald-700 text-xs border-r border-gray-300 whitespace-nowrap">
                              Rs. {data.summary.totalSales.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-2.5 text-[11px] text-gray-500 font-medium">
                              Ledger Settled
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/80 text-xs text-center text-gray-600">
                        No sales transactions recorded during period: <strong>{data.cleanPeriodLabel}</strong>.
                      </div>
                    )}
                  </div>
                )}

                {/* EXPENSES LOG TABLE */}
                {(data.type === "all" || data.type === "expenses") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b-2 border-gray-800 pb-1.5 avoid-break">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Operating Overhead Expenses Ledger
                      </h3>
                      <span className="text-xs font-black text-red-700">
                        Total: Rs. {data.summary.totalExpenses.toLocaleString()}
                      </span>
                    </div>

                    {data.expenses && data.expenses.length > 0 ? (
                      <table className="w-full text-left text-xs border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100 text-gray-800 border-b border-gray-300 font-bold text-[11px]">
                            <th className="py-2.5 px-2.5 w-10 text-center border-r border-gray-300">S.N.</th>
                            <th className="py-2.5 px-2.5 w-24 border-r border-gray-300">Date (BS)</th>
                            <th className="py-2.5 px-2.5 border-r border-gray-300">Expense Item</th>
                            <th className="py-2.5 px-2.5 w-28 text-center border-r border-gray-300">Category</th>
                            <th className="py-2.5 px-2.5 text-right w-28 border-r border-gray-300">Amount (Rs.)</th>
                            <th className="py-2.5 px-2.5 text-gray-600">Description / Justification</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {data.expenses.map((e: any, idx: number) => (
                            <tr
                              key={e.id || e.sn || idx}
                              className={idx % 2 === 1 ? "bg-gray-50/70" : "bg-white"}
                            >
                              <td className="py-2 px-2.5 text-center text-gray-500 font-medium border-r border-gray-200">
                                {e.sn || idx + 1}
                              </td>
                              <td className="py-2 px-2.5 font-semibold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                                {e.dateBs}
                              </td>
                              <td className="py-2 px-2.5 font-bold text-gray-950 border-r border-gray-200">
                                {e.title}
                              </td>
                              <td className="py-2 px-2.5 text-center border-r border-gray-200">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-800 border border-gray-200 uppercase">
                                  {e.category}
                                </span>
                              </td>
                              <td className="py-2 px-2.5 text-right font-black text-red-700 border-r border-gray-200 whitespace-nowrap">
                                Rs. {e.amount.toLocaleString()}
                              </td>
                              <td className="py-2 px-2.5 text-[11px] text-gray-600">
                                {e.description || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 text-gray-950 font-bold border-t-2 border-gray-900 text-xs">
                            <td colSpan={4} className="py-2.5 px-3 text-right uppercase tracking-wider font-extrabold border-r border-gray-300">
                              Total Operating Expenses ({data.expenses.length} entries):
                            </td>
                            <td className="py-2.5 px-2.5 text-right font-black text-red-700 text-xs border-r border-gray-300 whitespace-nowrap">
                              Rs. {data.summary.totalExpenses.toLocaleString()}
                            </td>
                            <td className="py-2.5 px-2.5 text-[11px] text-gray-500 font-medium">
                              Overheads Disbursed
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/80 text-xs text-center text-gray-600">
                        No operating expenses recorded during period: <strong>{data.cleanPeriodLabel}</strong>.
                      </div>
                    )}
                  </div>
                )}

                {/* PURCHASES TRACKER TABLE */}
                {(data.type === "all" || data.type === "purchases") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b-2 border-gray-800 pb-1.5 avoid-break">
                      <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                        Raw Material Purchases & Supplier Procurement
                      </h3>
                      <span className="text-xs font-black text-amber-700">
                        Total: Rs. {data.summary.totalPurchases.toLocaleString()}
                      </span>
                    </div>

                    {data.purchases && data.purchases.length > 0 ? (
                      <table className="w-full text-left text-xs border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100 text-gray-800 border-b border-gray-300 font-bold text-[11px]">
                            <th className="py-2.5 px-2.5 w-10 text-center border-r border-gray-300">S.N.</th>
                            <th className="py-2.5 px-2.5 w-24 border-r border-gray-300">Date (BS)</th>
                            <th className="py-2.5 px-2.5 border-r border-gray-300">Supplier / Vendor</th>
                            <th className="py-2.5 px-2.5 border-r border-gray-300">Item Details & Breakdown</th>
                            <th className="py-2.5 px-2.5 w-24 text-center border-r border-gray-300">Status</th>
                            <th className="py-2.5 px-2.5 text-right w-28">Amount (Rs.)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {data.purchases.map((p: any, idx: number) => (
                            <tr
                              key={p.id || p.sn || idx}
                              className={idx % 2 === 1 ? "bg-gray-50/70" : "bg-white"}
                            >
                              <td className="py-2 px-2.5 text-center text-gray-500 font-medium border-r border-gray-200">
                                {p.sn || idx + 1}
                              </td>
                              <td className="py-2 px-2.5 font-semibold text-gray-900 border-r border-gray-200 whitespace-nowrap">
                                {p.dateBs}
                              </td>
                              <td className="py-2 px-2.5 font-bold text-gray-950 border-r border-gray-200">
                                {p.supplier}
                              </td>
                              <td className="py-2 px-2.5 text-gray-700 border-r border-gray-200">
                                <div>{p.itemDetails}</div>
                                {p.items && p.items.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {p.items.map((item: any, iIdx: number) => (
                                      <span
                                        key={iIdx}
                                        className="text-[9px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200"
                                      >
                                        {item.name}: {item.quantity} {item.unit} @ Rs. {Number(item.price || 0).toLocaleString()}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>
                              <td className="py-2 px-2.5 text-center border-r border-gray-200">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                                    p.status === "PAID"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                      : p.status === "PARTIAL"
                                      ? "bg-amber-50 text-amber-800 border-amber-300"
                                      : "bg-red-50 text-red-800 border-red-300"
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-2 px-2.5 text-right font-black text-amber-700 whitespace-nowrap">
                                Rs. {p.amount.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-100 text-gray-950 font-bold border-t-2 border-gray-900 text-xs">
                            <td colSpan={5} className="py-2.5 px-3 text-right uppercase tracking-wider font-extrabold border-r border-gray-300">
                              Total Material Purchases ({data.purchases.length} invoices):
                            </td>
                            <td className="py-2.5 px-2.5 text-right font-black text-amber-700 text-xs whitespace-nowrap">
                              Rs. {data.summary.totalPurchases.toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/80 text-xs text-center text-gray-600">
                        No raw material purchases recorded during period: <strong>{data.cleanPeriodLabel}</strong>.
                      </div>
                    )}
                  </div>
                )}

                {/* Final Net Margin Reconciliation (Combined or Multi-table View) */}
                {data.type === "all" && (
                  <div className="avoid-break bg-gray-50 border border-gray-300 rounded-lg p-4 text-xs">
                    <div className="flex items-center justify-between font-bold border-b border-gray-300 pb-2 mb-2">
                      <span className="uppercase tracking-wide text-gray-900">
                        Financial Reconciliation Summary
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-gray-800">
                      <div>
                        <span className="text-gray-500">Gross Sales Inflow:</span>{" "}
                        <strong className="text-emerald-700">Rs. {data.summary.totalSales.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Business Outflows:</span>{" "}
                        <strong className="text-red-700">
                          Rs. {(data.summary.totalExpenses + data.summary.totalPurchases).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-500">Net Operating Margin:</span>{" "}
                        <strong className={data.summary.netProfit >= 0 ? "text-emerald-800" : "text-red-800"}>
                          Rs. {data.summary.netProfit.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Official Sign-off & Verification Footer */}
                <div className="avoid-break pt-8 border-t-2 border-gray-800 grid grid-cols-2 gap-8 text-xs text-gray-800 mt-6">
                  <div>
                    <div className="border-b border-gray-400 w-48 mb-2" />
                    <p className="font-bold text-gray-950">Prepared By:</p>
                    <p className="text-[11px] text-gray-600">Finance & Accounts Section, KTM Decor (P) Ltd.</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Automated Electronic Ledger Verification</p>
                  </div>

                  <div className="flex flex-col items-end text-right">
                    <div className="border-b border-gray-400 w-48 mb-2" />
                    <p className="font-bold text-gray-950">Verified & Approved By:</p>
                    <p className="text-[11px] text-gray-600">Managing Director / Authorized Signatory</p>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold mt-0.5">
                      <CheckCircle2 size={12} />
                      <span>Certified Business Statement</span>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="avoid-break pt-3 text-[10px] text-center text-gray-400 border-t border-gray-200">
                  This certified electronic statement was generated by KTM Decor Dashboard ERP. Official accounting record valid for internal audits and tax preparation.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
