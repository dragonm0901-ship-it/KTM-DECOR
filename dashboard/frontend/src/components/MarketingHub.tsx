import React, { useState } from "react";
import { useStore, MarketingCampaign } from "../store/useStore";
import {
  Calendar,
  Copy,
  ExternalLink,
  Plus,
  X,
  Clock,
  FileText,
  Lightbulb,
  Briefcase,
  Megaphone,
  User,
  Trash2
} from "./ui/solar-icons";

interface MarketingHubProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingCampaign: MarketingCampaign | null;
  setEditingCampaign: (campaign: MarketingCampaign | null) => void;
}

export const MarketingHub: React.FC<MarketingHubProps> = ({
  showModal,
  setShowModal,
  editingCampaign,
  setEditingCampaign
}) => {
  const {
    campaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    user
  } = useStore();

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Note");
  const [status, setStatus] = useState<MarketingCampaign["status"]>("draft");
  const [scheduledDate, setScheduledDate] = useState("");
  const [assetUrl, setAssetUrl] = useState("");
  const [copy, setCopy] = useState("");
  const [notes, setNotes] = useState("");

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setTitle("");
    setCategory("Note");
    setStatus("draft");
    setScheduledDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
    setAssetUrl("");
    setCopy("");
    setNotes("");
    setShowModal(true);
  };

  const handleOpenEdit = (camp: MarketingCampaign) => {
    setEditingCampaign(camp);
    setTitle(camp.title);
    setCategory(camp.category || camp.platform || "Note");
    setStatus(camp.status);
    setScheduledDate(new Date(camp.scheduledDate).toISOString().split("T")[0]);
    setAssetUrl(camp.assetUrl || "");
    setCopy(camp.copy || "");
    setNotes(camp.notes || "");
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title,
      category,
      platform: category, // Keep platform field populated for backward compatibility
      status,
      scheduledDate,
      assetUrl,
      copy,
      notes
    };

    if (editingCampaign) {
      updateCampaign(editingCampaign._id, data);
    } else {
      createCampaign(data);
    }
    setShowModal(false);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter marketing entries
  const filteredEntries = campaigns.filter((c) => {
    const itemCategory = c.category || c.platform || "Note";
    if (categoryFilter !== "all" && itemCategory.toLowerCase() !== categoryFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    const norm = (cat || "").toLowerCase();
    if (norm.includes("note")) {
      return <FileText size={14} className="text-blue-500" />;
    }
    if (norm.includes("suggestion")) {
      return <Lightbulb size={14} className="text-amber-500" />;
    }
    return <Briefcase size={14} className="text-emerald-500" />;
  };

  const getCategoryBadgeClass = (cat: string) => {
    const norm = (cat || "").toLowerCase();
    if (norm.includes("note")) {
      return "border-blue-500/25 text-blue-600 dark:text-blue-400";
    }
    if (norm.includes("suggestion")) {
      return "border-amber-500/25 text-amber-600 dark:text-amber-400";
    }
    return "border-emerald-500/25 text-emerald-600 dark:text-emerald-400";
  };

  const columns: { id: MarketingCampaign["status"]; label: string; bg: string; text: string }[] = [
    { id: "draft", label: "Ideas & Drafts", bg: "bg-slate-100/50 dark:bg-slate-900/30", text: "text-slate-800 dark:text-slate-200" },
    { id: "discussion", label: "Under Discussion", bg: "bg-indigo-50/50 dark:bg-indigo-950/10", text: "text-indigo-800 dark:text-indigo-400" },
    { id: "active", label: "Completed & Active", bg: "bg-emerald-50/50 dark:bg-emerald-950/10", text: "text-emerald-800 dark:text-emerald-400" }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Marketing Collaboration Hub</h1>
          <p className="text-muted text-sm mt-1">
            Note down marketing tasks, suggest creative campaign ideas, and share reference documents with the team.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded font-semibold text-sm hover:bg-accent-dark transition-colors shadow-md shadow-accent/15"
        >
          <Plus size={16} />
          Create Entry
        </button>
      </div>

      {/* FILTER BAR - CATEGORIES */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", label: "All Items" },
            { id: "Note", label: "Notes" },
            { id: "Suggestion", label: "Suggestions" },
            { id: "Work Detail", label: "Work Details" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                categoryFilter.toLowerCase() === cat.id.toLowerCase()
                  ? "bg-accent/15 border-accent text-accent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* TEAM TIMELINE SCHEDULE */}
      <div className="glass-panel p-5 rounded-lg border border-border">
        <h2 className="text-base font-bold font-display mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-accent" />
          Collaboration Schedule Timeline
        </h2>
        
        {filteredEntries.length === 0 ? (
          <div className="text-center p-8 text-sm text-muted">
            No entries available under this category.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
            {filteredEntries.map((item) => {
              const itemCategory = item.category || item.platform || "Note";
              return (
                <div
                  key={item._id}
                  className="w-72 flex-shrink-0 snap-start bg-card border border-border p-4 rounded-md shadow-sm space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className={`flex items-center gap-1 bg-background border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getCategoryBadgeClass(itemCategory)}`}>
                      {getCategoryIcon(itemCategory)}
                      <span className="ml-1">{itemCategory}</span>
                    </div>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase border ${
                        item.status === "active"
                          ? "border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                          : item.status === "discussion"
                          ? "border-indigo-500/25 text-indigo-600 dark:text-indigo-400"
                          : "border-border text-muted"
                      }`}
                    >
                      {item.status === "discussion" ? "discussion" : item.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm line-clamp-1 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-muted mt-1.5">
                      <Clock size={11} />
                      <span>Target: {new Date(item.scheduledDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {item.copy && (
                    <div className="bg-background/80 border border-border/50 p-2.5 rounded text-xs space-y-1.5 relative">
                      <span className="text-[9px] text-muted uppercase tracking-wider block font-bold">Details / Content</span>
                      <p className="line-clamp-2 text-muted leading-relaxed font-sans">{item.copy}</p>
                      <div className="flex justify-between items-center pt-2">
                        <button
                          onClick={() => handleCopyText(item.copy || "", item._id)}
                          className="text-[10px] text-accent hover:text-accent-dark flex items-center gap-1 font-semibold"
                        >
                          <Copy size={10} />
                          {copiedId === item._id ? "Copied!" : "Copy Text"}
                        </button>
                        
                        {item.assetUrl && (
                          <a
                            href={item.assetUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-muted hover:text-foreground flex items-center gap-1 font-semibold"
                          >
                            <ExternalLink size={10} />
                            Reference Link
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-1 text-[10px] text-muted">
                    <span className="flex items-center gap-1">
                      <User size={10} />
                      {item.createdBy?.name || "Team Member"}
                    </span>
                    <div className="flex items-center gap-2">
                      {user?.role === "admin" && (
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this marketing entry and move it to the Trash Bin?")) {
                              deleteCampaign(item._id);
                            }
                          }}
                          className="p-1 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Move to Bin"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-xs text-muted hover:text-foreground border border-border bg-background hover:bg-border px-2.5 py-1 rounded font-medium transition-colors"
                      >
                        Edit details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRACKING STATUS GRID */}
      <div className="flex flex-row md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4">
        {columns.map((col) => {
          const colEntries = filteredEntries.filter((c) => c.status === col.id);
          return (
            <div key={col.id} className={`rounded-lg p-4 flex flex-col h-[520px] md:h-[calc(100vh-270px)] min-h-[350px] border border-border/60 ${col.bg} w-[88vw] md:w-auto shrink-0 snap-center`}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                <h3 className={`font-bold font-display text-sm ${col.text}`}>
                  {col.label}
                </h3>
                <span className="text-xs bg-border px-2 py-0.5 rounded font-bold text-muted">
                  {colEntries.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {colEntries.map((item) => {
                  const itemCategory = item.category || item.platform || "Note";
                  return (
                    <div
                      key={item._id}
                      className="p-4 rounded-md bg-card border border-border hover:border-accent hover:shadow-sm transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm leading-snug break-words flex-1">
                          {item.title}
                        </h4>
                        <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${getCategoryBadgeClass(itemCategory)}`}>
                          {getCategoryIcon(itemCategory)}
                          <span className="ml-1">{itemCategory}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted mt-2 line-clamp-2">
                        {item.notes || "No notes details."}
                      </p>

                      {item.copy && (
                        <div className="mt-3 flex items-center justify-between bg-background border border-border/50 p-2 rounded text-[10px]">
                          <span className="text-muted truncate flex-1 pr-2 font-mono">
                            {item.copy}
                          </span>
                          <button
                            onClick={() => handleCopyText(item.copy || "", item._id + "_col")}
                            className="text-accent hover:text-accent-dark font-semibold shrink-0"
                          >
                            {copiedId === item._id + "_col" ? "Copied" : "Copy"}
                          </button>
                        </div>
                      )}

                      <div className="mt-4 border-t border-border/50 pt-2 flex items-center justify-between">
                        <span className="text-[10px] text-muted font-medium flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(item.scheduledDate).toLocaleDateString()}
                        </span>
                        
                        <div className="flex items-center gap-3">
                          {user?.role === "admin" && (
                            <button
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this marketing entry and move it to the Trash Bin?")) {
                                  deleteCampaign(item._id);
                                }
                              }}
                              className="text-[10px] text-red-500 hover:text-red-700 font-bold uppercase tracking-wider"
                            >
                              Delete
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="text-[10px] text-accent hover:text-accent-dark font-bold uppercase tracking-wider"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {colEntries.length === 0 && (
                  <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center text-xs text-muted h-24 flex items-center justify-center">
                    No items in this status
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE/EDIT MARKETING ENTRY MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-lg border border-border p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Megaphone className="text-accent" size={20} />
                {editingCampaign ? "Update Marketing Entry" : "Create Marketing Entry"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Title / Subject
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                  placeholder="e.g. Summer Photoshoot Theme ideas"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    required
                  >
                    <option value="Note">Note</option>
                    <option value="Suggestion">Suggestion</option>
                    <option value="Work Detail">Work Detail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MarketingCampaign["status"])}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    required
                  >
                    <option value="draft">Idea / Draft</option>
                    <option value="discussion">Under Discussion</option>
                    <option value="active">Completed & Active</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Reference / Document URL
                  </label>
                  <input
                    type="text"
                    value={assetUrl}
                    onChange={(e) => setAssetUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    placeholder="https://docs.google.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Content / Work Description
                </label>
                <textarea
                  value={copy}
                  onChange={(e) => setCopy(e.target.value)}
                  className="w-full h-20 p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none text-sm"
                  placeholder="Paste details, guidelines, or ideas text here..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Notes / Feedback
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-16 p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none text-sm"
                  placeholder="Any immediate reviews or targets for this note..."
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-border pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-border rounded text-sm hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-colors shadow-md shadow-accent/15"
                >
                  {editingCampaign ? "Save Changes" : "Create Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
