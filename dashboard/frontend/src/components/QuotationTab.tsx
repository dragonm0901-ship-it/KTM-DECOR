import React, { useState, useEffect } from "react";
import { useStore, Quotation, QuotationItem } from "../store/useStore";
import {
  FileText,
  Plus,
  Trash2,
  Search,
  X,
  Calendar,
  DollarSign,
  CheckCircle,
  Download
} from "./ui/solar-icons";

// Helper function to convert numbers to Indian/Nepalese system words (Lakhs, Thousands, Rupees)
const numberToWords = (num: number): string => {
  if (num === 0) return "Zero Rupees Only";
  
  const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const doubleDigits = ["", "Ten", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  
  const convertLessThanThousand = (n: number): string => {
    let str = "";
    if (n >= 100) {
      str += singleDigits[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 10 && n < 20) {
      str += teens[n - 10] + " ";
    } else {
      if (n >= 20) {
        str += doubleDigits[Math.floor(n / 10)] + " ";
        n %= 10;
      }
      if (n > 0) {
        str += singleDigits[n] + " ";
      }
    }
    return str;
  };

  let result = "";
  let remaining = Math.round(num);

  // Crores
  if (remaining >= 10000000) {
    result += convertLessThanThousand(Math.floor(remaining / 10000000)) + "Crore ";
    remaining %= 10000000;
  }
  
  // Lakhs
  if (remaining >= 100000) {
    result += convertLessThanThousand(Math.floor(remaining / 100000)) + "Lakh ";
    remaining %= 100000;
  }
  
  // Thousands
  if (remaining >= 1000) {
    result += convertLessThanThousand(Math.floor(remaining / 1000)) + "Thousand ";
    remaining %= 1000;
  }
  
  // Hundreds & Tens
  if (remaining > 0) {
    result += convertLessThanThousand(remaining);
  }
  
  return result.trim() + " Rupees Only";
};

export const QuotationTab: React.FC = () => {
  const { quotations, createQuotation, updateQuotationStatus, deleteQuotation, user } = useStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

  // Form States
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientContact, setClientContact] = useState("");
  const [projectName, setProjectName] = useState("");
  const [voucherNo, setVoucherNo] = useState("");
  const [voucherDate, setVoucherDate] = useState("");
  const [amountInWords, setAmountInWords] = useState("");
  const [remarks, setRemarks] = useState("Delivery And fitting charge is not included in this quotation.");
  const [items, setItems] = useState<QuotationItem[]>([
    { description: "", size: "", quantity: 1, rate: 0, total: 0 }
  ]);
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0"); // default 0% or VAT
  const [status, setStatus] = useState<Quotation["status"]>("draft");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dynamic calculations for form
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const discountVal = Number(discount) || 0;
  const taxPercent = Number(tax) || 0;
  const taxableAmount = Math.max(0, subtotal - discountVal);
  const taxVal = Math.round(taxableAmount * (taxPercent / 100));
  const grandTotal = taxableAmount + taxVal;

  // Auto update Amount in Words when Grand Total changes
  useEffect(() => {
    setAmountInWords(numberToWords(grandTotal));
  }, [grandTotal]);

  // Add Row
  const handleAddItemRow = () => {
    setItems([...items, { description: "", size: "", quantity: 1, rate: 0, total: 0 }]);
  };

  // Remove Row
  const handleRemoveItemRow = (idx: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  // Row Change Handler
  const handleItemRowChange = (idx: number, field: keyof QuotationItem, value: any) => {
    const updated = items.map((item, i) => {
      if (i === idx) {
        const newItem = { ...item, [field]: value };
        if (field === "quantity" || field === "rate") {
          newItem.total = Number(newItem.quantity || 0) * Number(newItem.rate || 0);
        }
        return newItem;
      }
      return item;
    });
    setItems(updated);
  };

  // Submit quotation
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!clientName.trim() || !projectName.trim()) {
      setFormError("Client Name and Project Name are required.");
      return;
    }

    const invalidItem = items.some((item) => !item.description.trim() || item.rate <= 0 || item.quantity <= 0);
    if (invalidItem) {
      setFormError("Please enter valid descriptions, quantities, and rates for all items.");
      return;
    }

    setSubmitting(true);
    try {
      await createQuotation({
        clientName,
        clientEmail,
        clientContact,
        projectName,
        voucherNo,
        voucherDate,
        amountInWords,
        remarks,
        items: items.map((item) => ({
          description: item.description,
          size: item.size || "",
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          total: Number(item.quantity) * Number(item.rate)
        })),
        discount: discountVal,
        tax: taxPercent,
        grandTotal,
        status
      });
      setShowCreateModal(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to create quotation.");
    } finally {
      setSubmitting(false);
    }
  };

  // Status adjustment
  const handleStatusChange = async (id: string, newStatus: Quotation["status"]) => {
    try {
      await updateQuotationStatus(id, newStatus);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this quotation?")) {
      try {
        await deleteQuotation(id);
      } catch (err) {
        console.error("Failed to delete quotation", err);
      }
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("print-area")?.innerHTML;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Quotation - KTM DECOR</title>
          <style>
            @page {
              margin: 0;
              size: A4;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #000;
              background: #fff;
              margin: 0;
              padding: 20mm 15mm;
              line-height: 1.5;
            }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .flex-col { flex-direction: column; }
            .items-end { align-items: flex-end; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .w-full { width: 100%; }
            .w-12 { width: 3rem; }
            .w-16 { width: 4rem; }
            .w-28 { width: 7rem; }
            .max-w-\\[260px\\] { max-width: 260px; }
            .border { border: 1px solid #d1d5db; }
            .border-b { border-bottom: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-gray-300 { border-color: #d1d5db; }
            .pb-4 { padding-bottom: 1rem; }
            .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
            .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
            .p-2\\.5 { padding: 0.625rem; }
            .p-8 { padding: 2rem; }
            .m-2 { margin: 0.5rem; }
            .ml-2 { margin-left: 0.5rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mb-1 { margin-bottom: 0.25rem; }
            .space-y-1 > * + * { margin-top: 0.25rem; }
            .space-y-2 > * + * { margin-top: 0.5rem; }
            .space-y-4 > * + * { margin-top: 1rem; }
            .space-y-6 > * + * { margin-top: 1.5rem; }
            .gap-2 { gap: 0.5rem; }
            .gap-6 { gap: 1.5rem; }
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            @media (min-width: 768px) {
              .md\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
              .md\\:col-span-7 { grid-column: span 7 / span 7; }
              .md\\:col-span-5 { grid-column: span 5 / span 5; }
            }
            .bg-white { background-color: #fff; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-\\[\\#FE914C\\] { background-color: #FE914C; }
            .text-white { color: #fff; }
            .text-black { color: #000; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .text-gray-950 { color: #030712; }
            .text-xs { font-size: 0.75rem; }
            .text-sm { font-size: 0.875rem; }
            .text-lg { font-size: 1.125rem; }
            .text-xl { font-size: 1.25rem; }
            .text-2xl { font-size: 1.5rem; }
            .font-bold { font-weight: 700; }
            .font-extrabold { font-weight: 800; }
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .italic { font-style: italic; }
            .uppercase { text-transform: uppercase; }
            .tracking-widest { letter-spacing: 0.1em; }
            .tracking-wider { letter-spacing: 0.05em; }
            .leading-none { line-height: 1; }
            .leading-snug { line-height: 1.375; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #d1d5db; padding: 0.625rem; text-align: left; }
            th { background-color: #FE914C; color: white; font-weight: bold; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            img { max-height: 80px; width: auto; object-fit: contain; }
          </style>
        </head>
        <body>
          <div style="padding: 10px;">
            ${printContent}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Filtered List
  const filteredQuotations = quotations.filter((q) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      q.clientName.toLowerCase().includes(query) ||
      q.projectName.toLowerCase().includes(query);

    const matchesStatus = statusFilter === "all" || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Quotation["status"]) => {
    switch (status) {
      case "accepted":
        return "bg-green-600 border-green-600 text-white";
      case "sent":
        return "bg-blue-600 border-blue-600 text-white";
      case "rejected":
        return "bg-red-600 border-red-600 text-white";
      default:
        return "bg-gray-600 border-gray-600 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Print styles override */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .screen-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <FileText className="text-accent" />
            Quotations Manager
          </h1>
          <p className="text-xs text-muted mt-1">
            Build, print, and send formal price estimations for custom neon designs and backlit signs.
          </p>
        </div>

        <button
          onClick={() => {
            setClientName("");
            setClientEmail("");
            setClientContact("");
            setProjectName("");
            setVoucherNo((quotations.length + 1).toString());
            // Pre-fill voucher date with simple format
            setVoucherDate(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }));
            setAmountInWords("");
            setRemarks("Delivery And fitting charge is not included in this quotation.");
            setItems([{ description: "", size: "", quantity: 1, rate: 0, total: 0 }]);
            setDiscount("0");
            setTax("0");
            setStatus("draft");
            setFormError("");
            setShowCreateModal(true);
          }}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-accent/15 self-start sm:self-auto"
        >
          <Plus size={16} />
          Create Quotation
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-card border border-border/80 shadow-sm p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <FileText size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Total Generated</span>
            <h3 className="text-lg font-bold mt-1 text-foreground font-display">{quotations.length} Estimations</h3>
            <p className="text-[9px] text-muted mt-0.5">Quotations & proposals</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 shadow-sm p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <CheckCircle size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Accepted Quotes</span>
            <h3 className="text-lg font-bold mt-1 text-green-500 font-display">
              {quotations.filter((q) => q.status === "accepted").length} Approved
            </h3>
            <p className="text-[9px] text-muted mt-0.5">Converted to active pipeline</p>
          </div>
        </div>

        <div className="bg-card border border-border/80 shadow-sm p-5 rounded-2xl flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-[10px] text-muted uppercase font-bold tracking-wider">Total Value Proposed</span>
            <h3 className="text-lg font-bold mt-1 text-foreground font-display">
              Rs. {quotations.reduce((sum, q) => sum + q.grandTotal, 0).toLocaleString()}
            </h3>
            <p className="text-[9px] text-muted mt-0.5">Value of all draft & sent quotes</p>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-card border border-border/80 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 pl-9 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs"
            placeholder="Search by client or project name..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted" />
        </div>

        <div className="flex items-center gap-2 text-xs w-full md:w-auto">
          <span className="text-muted font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Quotations</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Quotation Table */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-card text-muted border-b border-border uppercase font-semibold tracking-wider text-[10px]">
                <th className="p-4">Date</th>
                <th className="p-4">Voucher No</th>
                <th className="p-4">Client Name</th>
                <th className="p-4">Project Name</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Grand Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted">
                    No quotations matching these criteria.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((quote) => (
                  <tr key={quote._id} className="hover:bg-border/20 transition-colors">
                    <td className="p-4 font-semibold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-muted" />
                        {new Date(quote.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {quote.voucherNo || "—"}
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      {quote.clientName}
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      {quote.projectName}
                    </td>
                    <td className="p-4 text-center">
                      <select
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote._id, e.target.value as any)}
                        className={`px-2.5 py-1 text-[9px] font-bold rounded-xl border uppercase cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 ${getStatusBadge(quote.status)}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-right font-extrabold text-foreground text-sm">
                      Rs. {quote.grandTotal.toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedQuotation(quote)}
                          className="p-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 transition-colors shadow-sm"
                          title="Generate printable invoice estimate layout"
                        >
                          <Download size={14} />
                        </button>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDelete(quote._id)}
                            className="p-1.5 bg-red-600 rounded text-white hover:bg-red-700 transition-colors shadow-sm"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-4xl rounded-2xl border border-border/80 p-4 sm:p-6 shadow-2xl animate-scale-up my-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <FileText className="text-accent" />
                Generate Price Proposal Estimation
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 text-xs bg-red-600 border border-red-600 text-white rounded font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-6 text-left">
              {/* QUOTATION VOUCHER INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-border/10 p-4 rounded-xl border border-border/60">
                <div>
                  <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                    Voucher Number *
                  </label>
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm font-bold"
                    placeholder="e.g. 001"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                    Voucher Date (Bikram Sambat / Custom) *
                  </label>
                  <input
                    type="text"
                    value={voucherDate}
                    onChange={(e) => setVoucherDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm font-bold"
                    placeholder="e.g. 2083 Jes 13"
                    required
                  />
                </div>
              </div>

              {/* CLIENT DETAILS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-border/20 p-4 rounded-xl border border-border/80">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border/50 pb-1">
                    Client Details (Party)
                  </h3>
                  <div>
                    <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                      Party / Client Name *
                    </label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm"
                      placeholder="e.g. Ram Kumar"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                        Contact
                      </label>
                      <input
                        type="text"
                        value={clientContact}
                        onChange={(e) => setClientContact(e.target.value)}
                        className="w-full px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm"
                        placeholder="e.g. 984XXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        className="w-full px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm"
                        placeholder="client@mail.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider border-b border-border/50 pb-1">
                    Project Info & Status
                  </h3>
                  <div>
                    <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                      Project / Design Title *
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm"
                      placeholder="e.g. LED Acrylic Sign Board for Cafe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                      Quotation Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm font-semibold cursor-pointer"
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent to Client</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ITEMS DETAILS TABLE */}
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-1">
                  <h3 className="text-xs font-bold text-accent uppercase tracking-wider">
                    Line Item Estimates
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="flex items-center justify-center gap-1 py-1 px-2.5 bg-accent/15 border border-accent/30 text-accent hover:bg-accent hover:text-white rounded text-[10px] font-bold transition-all"
                  >
                    <Plus size={12} />
                    Add Item Row
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-card border border-border/80 p-2.5 rounded-xl">
                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[8px] font-bold text-muted uppercase mb-0.5">Description *</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemRowChange(idx, "description", e.target.value)}
                          className="w-full px-2 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold"
                          placeholder="e.g. Golden SS Logo with lights"
                          required
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[8px] font-bold text-muted uppercase mb-0.5">Size</label>
                        <input
                          type="text"
                          value={item.size || ""}
                          onChange={(e) => handleItemRowChange(idx, "size", e.target.value)}
                          className="w-full px-2 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold"
                          placeholder="e.g. 4' x 4'"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[8px] font-bold text-muted uppercase mb-0.5">Qty *</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemRowChange(idx, "quantity", Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs text-center font-bold"
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-[8px] font-bold text-muted uppercase mb-0.5">Rate (Rs.) *</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemRowChange(idx, "rate", Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs text-right font-bold"
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 text-right font-extrabold text-xs px-2 pt-2 sm:pt-3.5 flex flex-col justify-end">
                        <span className="block text-[8px] font-bold text-muted uppercase mb-0.5 sm:hidden">Total</span>
                        <span className="inline-block pt-1 sm:pt-0">Rs. {(item.quantity * item.rate).toLocaleString()}</span>
                      </div>
                      <div className="col-span-1 sm:col-span-1 text-center pt-2 sm:pt-3">
                        <span className="block text-[8px] font-bold text-muted uppercase mb-0.5 sm:hidden">Del</span>
                        <div className="pt-1 sm:pt-0 flex justify-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItemRow(idx)}
                              className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm"
                              title="Remove item"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CALCULATION & LEGAL TEXT FILLINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                      Amount in Words (Auto-suggested, Editable)
                    </label>
                    <input
                      type="text"
                      value={amountInWords}
                      onChange={(e) => setAmountInWords(e.target.value)}
                      className="w-full px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs italic font-semibold text-accent"
                      placeholder="Amount in Words"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-muted uppercase tracking-wider mb-1">
                      Remarks / Notes
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="w-full h-16 px-3 py-1.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs resize-none font-semibold text-muted"
                      placeholder="e.g. Delivery and fitting charge is not included"
                    />
                  </div>
                </div>

                <div className="flex justify-end items-start">
                  <div className="w-72 bg-border/20 p-4 rounded-xl border border-border/80 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal:</span>
                      <span className="font-bold text-foreground">Rs. {subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">Discount (Rs.):</span>
                      <input
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-24 px-2 py-1 border border-border rounded-xl bg-background text-right font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs"
                        min="0"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span className="text-muted-foreground">VAT Tax (%):</span>
                      <input
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(e.target.value)}
                        className="w-24 px-2 py-1 border border-border rounded-xl bg-background text-right font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs"
                        min="0"
                      />
                    </div>

                    <div className="border-t border-border pt-2 flex justify-between items-center text-sm font-extrabold mt-1">
                      <span className="text-accent">GRAND TOTAL:</span>
                      <span className="text-accent font-display text-base">Rs. {grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 border border-border rounded-xl text-xs hover:bg-border transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-accent text-white rounded-xl text-xs hover:bg-accent-dark transition-colors shadow-md shadow-accent/15 font-bold disabled:opacity-50"
                >
                  {submitting ? "Saving Proposal..." : "Generate Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Estimations Printable PDF Preview Modal */}
      {selectedQuotation && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-3xl rounded-2xl border border-border/80 p-3 sm:p-6 shadow-2xl animate-scale-up my-4 max-h-[85vh] sm:max-h-[95vh] overflow-y-auto">
            
            {/* Modal Controls */}
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2 screen-only">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <FileText size={16} />
                Quotation Preview
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1 py-1.5 px-3 bg-[#FE914C] hover:bg-[#E2752D] text-white rounded text-[10px] font-bold transition-colors shadow-sm"
                >
                  <Download size={12} />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedQuotation(null)}
                  className="text-muted hover:text-foreground p-1"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PRINT AREA */}
            <div id="print-area" className="bg-white text-black p-4 sm:p-8 rounded border border-gray-300 font-sans text-left space-y-6 select-text">
              
              {/* Invoice Header */}
              <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-950 font-display leading-none">KTM Decor</h1>
                  <p className="text-[11px] font-bold text-gray-700 mt-2">
                    {`9706247439 \u00A0\u00B7\u00A0 Balkot`}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <img src="/admin/logo/ktm%20decor.svg" alt="KTM Decor Logo" className="h-20 w-auto object-contain" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center py-2">
                <h2 className="text-xl font-extrabold tracking-widest text-gray-950 uppercase">
                  Quotation
                </h2>
              </div>

              {/* Party & Voucher Details */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 text-[11px] font-semibold text-gray-800 border-t border-b border-gray-200 py-3">
                <div className="flex gap-2">
                  <span className="text-gray-500 font-medium">Party:</span>
                  <span className="font-extrabold text-gray-950 text-xs">{selectedQuotation.clientName}</span>
                </div>
                <div className="space-y-1 text-left sm:text-right">
                  <div>
                    <span className="text-gray-500 font-medium">Voucher No:</span>
                    <span className="ml-2 font-bold text-gray-950">{selectedQuotation.voucherNo || "—"}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">Voucher Date:</span>
                    <span className="ml-2 font-bold text-gray-950">{selectedQuotation.voucherDate || "—"}</span>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto w-full border border-gray-300 rounded">
                <table className="w-full text-[11px] text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-[#FE914C] text-white font-bold border-b border-gray-300">
                      <th className="p-2.5 text-center border-r border-gray-300/30 w-12">S.N.</th>
                      <th className="p-2.5 border-r border-gray-300/30">Name</th>
                      <th className="p-2.5 border-r border-gray-300/30 w-24">Size</th>
                      <th className="p-2.5 text-center border-r border-gray-300/30 w-16">Qty</th>
                      <th className="p-2.5 text-right border-r border-gray-300/30 w-28">Rate</th>
                      <th className="p-2.5 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {selectedQuotation.items.map((item, idx) => (
                      <tr key={idx} className="text-gray-900 bg-white">
                        <td className="p-2.5 text-center border-r border-gray-300 font-medium">{idx + 1}</td>
                        <td className="p-2.5 border-r border-gray-300 font-medium text-xs whitespace-pre-line">{item.description}</td>
                        <td className="p-2.5 border-r border-gray-300 font-medium text-xs">{item.size || "—"}</td>
                        <td className="p-2.5 text-center border-r border-gray-300 font-bold">{item.quantity}</td>
                        <td className="p-2.5 text-right border-r border-gray-300">Rs. {item.rate.toLocaleString()}</td>
                        <td className="p-2.5 text-right font-bold">Rs. {item.total.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculations and amount in words */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                <div className="md:col-span-7 space-y-4 text-[10px]">
                  <div>
                    <h4 className="font-extrabold text-gray-700 uppercase tracking-wider mb-1">Amount in Words</h4>
                    <p className="text-[11px] font-semibold text-gray-900 bg-gray-50 p-2.5 rounded border border-gray-200 italic leading-snug">
                      {selectedQuotation.amountInWords || numberToWords(selectedQuotation.grandTotal)}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-extrabold text-gray-700 uppercase tracking-wider mb-1">Remarks</h4>
                    <p className="text-[11px] font-medium text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200 leading-snug">
                      {selectedQuotation.remarks || "—"}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-5 flex justify-end items-start">
                  <div className="w-full max-w-[260px] space-y-2 text-[11px] font-semibold text-gray-800">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sub Total:</span>
                      <span className="font-bold text-gray-950">Rs. {selectedQuotation.items.reduce((sum, i) => sum + i.total, 0).toLocaleString()}</span>
                    </div>
                    {selectedQuotation.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>- Rs. {selectedQuotation.discount.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedQuotation.tax > 0 && (
                      <div className="flex justify-between">
                        <span>VAT ({selectedQuotation.tax}%):</span>
                        <span>
                          Rs. {Math.round(Math.max(0, selectedQuotation.items.reduce((sum, i) => sum + i.total, 0) - selectedQuotation.discount) * (selectedQuotation.tax / 100)).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="border-t-2 border-gray-300 pt-2 flex justify-between items-center text-xs font-black text-gray-950">
                      <span>Total Amount:</span>
                      <span className="text-sm font-black text-gray-950">Rs. {selectedQuotation.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Print Area close button */}
            <div className="flex justify-end border-t border-border pt-4 mt-6 screen-only">
              <button
                type="button"
                onClick={() => setSelectedQuotation(null)}
                className="px-5 py-2 bg-zinc-600 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all shadow shadow-zinc-500/10"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
