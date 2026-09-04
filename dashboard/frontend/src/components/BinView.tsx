import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  Trash2,
  RotateCcw,
  Clock,
  Briefcase,
  FileText,
  Package,
  MapPin
} from "./ui/solar-icons";
import { formatNepali } from "../utils/nepaliDate";

export const BinView: React.FC = () => {
  const {
    binTasks,
    binCampaigns,
    binOrders,
    restoreBinItem,
    deleteBinItemPermanently
  } = useStore();

  const [activeTab, setActiveTab] = useState<"tasks" | "marketing" | "orders">("tasks");

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



  const handleRestore = async (type: "task" | "campaign" | "order", id: string) => {
    if (window.confirm(`Are you sure you want to restore this ${
      type === "task" ? "task" : type === "campaign" ? "marketing entry" : "order"
    }?`)) {
      await restoreBinItem(type, id);
    }
  };

  const handleForceDelete = async (type: "task" | "campaign" | "order", id: string) => {
    if (
      window.confirm(
        `Warning: This will permanently delete this ${
          type === "task" ? "task" : type === "campaign" ? "marketing entry" : "order"
        } immediately. This action cannot be undone. Proceed?`
      )
    ) {
      await deleteBinItemPermanently(type, id);
    }
  };

  return (
    <div className="space-y-6">
      {/* TABS SELECTOR (Porcelain Segmented Pill Control) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border/80 rounded-2xl w-max shadow-xs">
        <button
          onClick={() => setActiveTab("tasks")}
          style={activeTab === "tasks" ? { background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)" } : undefined}
          className={`py-2 px-4 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "tasks"
              ? "text-black shadow-xs"
              : "text-muted hover:text-foreground hover:bg-muted/20"
          }`}
        >
          <Briefcase size={15} />
          Deleted Tasks
          <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            activeTab === "tasks" ? "bg-black/20 text-black" : "bg-muted/20 text-muted"
          }`}>
            {binTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("marketing")}
          style={activeTab === "marketing" ? { background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)" } : undefined}
          className={`py-2 px-4 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "marketing"
              ? "text-black shadow-xs"
              : "text-muted hover:text-foreground hover:bg-muted/20"
          }`}
        >
          <FileText size={15} />
          Deleted Field Notes
          <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            activeTab === "marketing" ? "bg-black/20 text-black" : "bg-muted/20 text-muted"
          }`}>
            {binCampaigns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          style={activeTab === "orders" ? { background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)" } : undefined}
          className={`py-2 px-4 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "orders"
              ? "text-black shadow-xs"
              : "text-muted hover:text-foreground hover:bg-muted/20"
          }`}
        >
          <Package size={15} />
          Deleted Orders
          <span className={`ml-1 text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
            activeTab === "orders" ? "bg-black/20 text-black" : "bg-muted/20 text-muted"
          }`}>
            {binOrders?.length || 0}
          </span>
        </button>
      </div>

      {/* MAIN CONTAINER */}
      <div className="space-y-4">
        {activeTab === "orders" ? (
          (!binOrders || binOrders.length === 0) ? (
            <div className="bg-card border border-border/80 border-dashed rounded-[28px] shadow-xs p-12 text-center max-w-lg mx-auto mt-6">
              <Trash2 className="mx-auto text-muted/30 mb-3" size={48} />
              <h3 className="font-bold text-sm text-foreground">Order Bin is Empty</h3>
              <p className="text-xs text-muted mt-1 font-medium">No soft-deleted orders are stored here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {binOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-card border border-border/80 p-6 rounded-[28px] flex flex-col justify-between shadow-xs relative group hover:border-accent/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-sm leading-snug break-words flex-1 text-foreground">
                        {order.productName}
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap shadow-2xs">
                        <Clock size={11} />
                        {getExpirationDays(order.updatedAt)}
                      </span>
                    </div>

                    <div className="text-xs text-muted space-y-1 bg-background/60 p-3.5 rounded-2xl border border-border/60">
                      <div>Client: <strong className="text-foreground">{order.customerName}</strong></div>
                      <div>Contact: <strong className="text-foreground">{order.customerContact}</strong></div>
                      <div>Address: <span className="text-foreground">{order.customerAddress}</span></div>
                      {order.manufacturingNotes && (
                        <div className="text-[10px] text-muted italic mt-1.5 bg-accent/5 p-2 rounded-xl border border-dashed border-accent/20 font-medium">
                          Note: {order.manufacturingNotes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-muted border-t border-border/60 pt-3">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shadow-2xs">
                        Adv: Rs. {(order.advancePayment || 0).toLocaleString()}
                      </span>
                      <span className="text-red-500 font-bold bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full shadow-2xs">
                        Due: Rs. {(order.duePayment || 0).toLocaleString()}
                      </span>
                      <span className="bg-card border border-border/80 px-2.5 py-0.5 rounded-full font-bold text-foreground shadow-2xs">
                        Total: Rs. {order.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border/60">
                    <button
                      onClick={() => handleRestore("order", order._id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border/80 rounded-xl text-xs font-bold hover:bg-muted/20 bg-card text-foreground transition-all shadow-2xs cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                    <button
                      onClick={() => handleForceDelete("order", order._id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : activeTab === "tasks" ? (
          binTasks.length === 0 ? (
            <div className="bg-card border border-border/80 border-dashed rounded-[28px] shadow-xs p-12 text-center max-w-lg mx-auto mt-6">
              <Trash2 className="mx-auto text-muted/30 mb-3" size={48} />
              <h3 className="font-bold text-sm text-foreground">Task Bin is Empty</h3>
              <p className="text-xs text-muted mt-1 font-medium">No soft-deleted tasks are stored here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {binTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-card border border-border/80 p-6 rounded-[28px] flex flex-col justify-between shadow-xs relative group hover:border-accent/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-sm leading-snug break-words flex-1 text-foreground">
                        {task.title}
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap shadow-2xs">
                        <Clock size={11} />
                        {getExpirationDays(task.updatedAt)}
                      </span>
                    </div>

                    <p className="text-xs text-muted line-clamp-2 bg-background/60 p-3.5 rounded-2xl border border-border/60">
                      {task.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2.5 text-[10px] text-muted border-t border-border/60 pt-3">
                      <span className="bg-card border border-border/80 px-2.5 py-0.5 rounded-full font-bold text-foreground shadow-2xs">
                        Priority: {task.priority.toUpperCase()}
                      </span>
                      <span>Assignee: <strong className="text-foreground">{task.assignee?.name || "Unassigned"}</strong></span>
                      <span>•</span>
                      <span>Deleted: {task.updatedAt ? formatNepali(task.updatedAt) : ""}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border/60">
                    <button
                      onClick={() => handleRestore("task", task._id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border/80 rounded-xl text-xs font-bold hover:bg-muted/20 bg-card text-foreground transition-all shadow-2xs cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                    <button
                      onClick={() => handleForceDelete("task", task._id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
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
          <div className="bg-card border border-border/80 border-dashed rounded-[28px] shadow-xs p-12 text-center max-w-lg mx-auto mt-6">
            <Trash2 className="mx-auto text-muted/30 mb-3" size={48} />
            <h3 className="font-bold text-sm text-foreground">Field Notes Bin is Empty</h3>
            <p className="text-xs text-muted mt-1 font-medium">No soft-deleted field notes are stored here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {binCampaigns.map((item) => {
              return (
                <div
                  key={item._id}
                  className="bg-card border border-border/80 p-6 rounded-[28px] flex flex-col justify-between shadow-xs relative group hover:border-accent/40 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-sm leading-snug break-words flex-1 text-foreground">
                        {item.title}
                      </h4>
                      <span className="flex items-center gap-1 text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap shadow-2xs">
                        <Clock size={11} />
                        {getExpirationDays(item.updatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-accent">
                      <MapPin size={12} />
                      <span className="truncate">{item.district}, {item.location}</span>
                    </div>

                    <p className="text-xs text-muted line-clamp-3 bg-background/60 p-3.5 rounded-2xl border border-border/60">
                      {item.description || "No description provided."}
                    </p>

                    <div className="text-[10px] text-muted border-t border-border/60 pt-3 space-y-1">
                      {item.email && <div>Email: <strong className="text-foreground">{item.email}</strong></div>}
                      <div>Deleted: {item.updatedAt ? formatNepali(item.updatedAt) : ""}</div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-border/60">
                    <button
                      onClick={() => handleRestore("campaign", item._id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 border border-border/80 rounded-xl text-xs font-bold hover:bg-muted/20 bg-card text-foreground transition-all shadow-2xs cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                    <button
                      onClick={() => handleForceDelete("campaign", item._id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 border border-red-500/30 text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
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
