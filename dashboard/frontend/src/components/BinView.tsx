import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  Trash2,
  RotateCcw,
  Clock,
  Briefcase,
  Lightbulb,
  FileText,
  Megaphone
} from "./ui/solar-icons";

export const BinView: React.FC = () => {
  const {
    binTasks,
    binCampaigns,
    restoreBinItem,
    deleteBinItemPermanently
  } = useStore();

  const [activeTab, setActiveTab] = useState<"tasks" | "marketing">("tasks");

  const getExpirationDays = (deletedAtStr: string | undefined) => {
    if (!deletedAtStr) return "7 days remaining";
    const deletedAt = new Date(deletedAtStr);
    const purgeDate = new Date(deletedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const diffTime = purgeDate.getTime() - now.getTime();
    if (diffTime <= 0) return "Purging soon...";
    
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHours < 24) {
      return `Expires in ${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
    }
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `Expires in ${diffDays} ${diffDays === 1 ? "day" : "days"}`;
  };

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

  const handleRestore = async (type: "task" | "campaign", id: string) => {
    if (window.confirm(`Are you sure you want to restore this ${type === "task" ? "task" : "marketing entry"}?`)) {
      await restoreBinItem(type, id);
    }
  };

  const handleForceDelete = async (type: "task" | "campaign", id: string) => {
    if (
      window.confirm(
        `Warning: This will permanently delete this ${
          type === "task" ? "task" : "marketing entry"
        } immediately. This action cannot be undone. Proceed?`
      )
    ) {
      await deleteBinItemPermanently(type, id);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display">Trash Bin</h1>
        <p className="text-muted text-sm mt-1">
          Review items deleted by Admins. Soft-deleted items are stored here for exactly 1 week (7 days) before being permanently purged.
        </p>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "tasks"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Briefcase size={16} />
          Deleted Tasks
          <span className="ml-1 bg-border text-muted text-xs px-2 py-0.5 rounded-full font-bold">
            {binTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("marketing")}
          className={`py-2.5 px-4 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "marketing"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Megaphone size={16} />
          Deleted Marketing Notes
          <span className="ml-1 bg-border text-muted text-xs px-2 py-0.5 rounded-full font-bold">
            {binCampaigns.length}
          </span>
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="space-y-4">
        {activeTab === "tasks" ? (
          binTasks.length === 0 ? (
            <div className="glass-panel p-12 text-center border-dashed border-2 border-border/60 rounded-lg max-w-lg mx-auto mt-6">
              <Trash2 className="mx-auto text-muted/30 mb-3" size={48} />
              <h3 className="font-bold text-sm">Task Bin is Empty</h3>
              <p className="text-xs text-muted mt-1">No soft-deleted tasks are stored here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {binTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-card border border-border p-5 rounded-lg flex flex-col justify-between shadow-sm relative group hover:border-accent/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-sm leading-snug break-words flex-1">
                        {task.title}
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 border border-amber-500/25 px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap">
                        <Clock size={11} />
                        {getExpirationDays(task.updatedAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted line-clamp-2">
                      {task.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted border-t border-border/50 pt-2">
                      <span className="bg-background border border-border px-2 py-0.5 rounded font-medium">
                        Priority: {task.priority.toUpperCase()}
                      </span>
                      <span>Assignee: {task.assignee.name}</span>
                      <span>Deleted: {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : ""}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border/40">
                    <button
                      onClick={() => handleRestore("task", task._id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-border rounded text-xs font-semibold hover:bg-border text-foreground transition-colors"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                    <button
                      onClick={() => handleForceDelete("task", task._id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-500/30 text-red-500 rounded text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={12} />
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : binCampaigns.length === 0 ? (
          <div className="glass-panel p-12 text-center border-dashed border-2 border-border/60 rounded-lg max-w-lg mx-auto mt-6">
            <Trash2 className="mx-auto text-muted/30 mb-3" size={48} />
            <h3 className="font-bold text-sm">Marketing Bin is Empty</h3>
            <p className="text-xs text-muted mt-1">No soft-deleted marketing updates are stored here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {binCampaigns.map((item) => {
              const itemCategory = item.category || item.platform || "Note";
              return (
                <div
                  key={item._id}
                  className="bg-card border border-border p-5 rounded-lg flex flex-col justify-between shadow-sm relative group hover:border-accent/40 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-sm leading-snug break-words flex-1">
                        {item.title}
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] text-amber-600 border border-amber-500/25 px-2 py-0.5 rounded font-bold uppercase whitespace-nowrap">
                        <Clock size={11} />
                        {getExpirationDays(item.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 border px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${getCategoryBadgeClass(itemCategory)}`}>
                        {getCategoryIcon(itemCategory)}
                        <span className="ml-1">{itemCategory}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted line-clamp-2">
                      {item.notes || "No notes details."}
                    </p>

                    <div className="text-[10px] text-muted border-t border-border/50 pt-2">
                      <span>Deleted: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ""}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border/40">
                    <button
                      onClick={() => handleRestore("campaign", item._id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-border rounded text-xs font-semibold hover:bg-border text-foreground transition-colors"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                    <button
                      onClick={() => handleForceDelete("campaign", item._id)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-500/30 text-red-500 rounded text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={12} />
                      Delete Permanently
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
