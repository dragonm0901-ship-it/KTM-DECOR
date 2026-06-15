import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import {
  LayoutDashboard,
  CheckSquare,
  Megaphone,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Trash2,
  ShoppingBag,
  Package,
  Truck,
  TrendingUp,
  Briefcase,
  FileText,
  DollarSign,
  Menu,
  MessageSquare
} from "./ui/solar-icons";

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  setCurrentTab,
  children
}) => {
  const {
    user,
    logout,
    theme,
    toggleTheme,
    notifications,
    markNotificationsRead,
    createAnnouncement,
    users,
    activeStaffProfile,
    setActiveStaffProfile
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => {
    if (n.recipient === null) {
      // Global system announcement - check if user ID is in readBy list
      return !n.readBy.includes(user?._id || "");
    }
    return !n.read;
  }).length;

  const handleMarkAllRead = () => {
    markNotificationsRead();
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementMsg.trim()) return;
    createAnnouncement(announcementMsg);
    setAnnouncementMsg("");
    setShowAnnouncementModal(false);
  };

  const navigationCategories = [
    {
      title: "Core",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "calendar", label: "Calendar", icon: Calendar },
        { id: "tasks", label: "Tasks Board", icon: CheckSquare },
        { id: "field-notes", label: "Field Notes", icon: FileText }
      ]
    },
    {
      title: "Operations",
      items: [
        { id: "orders", label: "Orders", icon: Package },
        { id: "order-progress", label: "Order Progress", icon: Truck },
        { id: "inventory", label: "Inventory", icon: Package }
      ]
    },
    ...(user?.role === "admin" ? [
      {
        title: "Finance & Sales",
        items: [
          { id: "sales", label: "Sales Ledger", icon: TrendingUp },
          { id: "expenses", label: "Expenses Log", icon: DollarSign },
          { id: "purchase", label: "Purchases", icon: Briefcase },
          { id: "quotation", label: "Quotations", icon: FileText }
        ]
      },
      {
        title: "Management",
        items: [
          { id: "products", label: "Shop Catalog", icon: ShoppingBag },
          { id: "bin", label: "Trash Bin", icon: Trash2 }
        ]
      }
    ] : [])
  ];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full glass-panel h-16 px-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-md hover:bg-border transition-colors text-muted hover:text-foreground -ml-1.5"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          
          <img
            src="/admin/logo/ktm%20decor.svg"
            alt="KTM DECOR"
            className="h-8 w-auto object-contain dark:invert dark:hue-rotate-180 ml-1 md:ml-0"
          />
          <span className="text-[10px] border border-accent/30 text-accent px-2 py-0.5 rounded font-bold uppercase tracking-wider ml-1 hidden sm:inline-block">
            Dashboard
          </span>
        </div>


        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-border transition-colors text-muted hover:text-foreground hidden md:inline-flex"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setNotifDropdownOpen(!notifDropdownOpen);
                if (!notifDropdownOpen) {
                  // Keep open state
                }
              }}
              className="p-2 rounded-md hover:bg-border transition-colors text-muted hover:text-foreground relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full text-xs font-bold flex items-center justify-center animate-badge-blink shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifDropdownOpen && (
              <div className="fixed sm:absolute top-16 sm:top-auto left-0 sm:left-auto right-0 sm:right-0 mt-1 sm:mt-2 w-full sm:w-auto flex justify-center sm:block z-50">
                <div className="w-[calc(100vw-32px)] sm:w-96 max-w-[340px] sm:max-w-none glass-panel rounded-lg shadow-xl border border-border overflow-hidden animate-slide-up">
                  <div className="p-3 border-b border-border flex items-center justify-between bg-card">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-accent hover:text-accent-dark font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted text-sm">
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isRead =
                          notif.recipient === null
                            ? notif.readBy.includes(user?._id || "")
                            : notif.read;

                        return (
                          <div
                            key={notif._id || Math.random().toString()}
                            onClick={() => {
                              if (notif.type === "task_assigned") {
                                setCurrentTab("tasks");
                              } else if (notif.type === "marketing_deadline" || notif.type === "new_field_note") {
                                setCurrentTab("field-notes");
                              } else if (notif.type === "order_assigned" || notif.type === "new_order") {
                                setCurrentTab("order-progress");
                              } else if (notif.type === "new_quick_note") {
                                setCurrentTab("overview");
                              }
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3 text-sm flex gap-3 cursor-pointer hover:bg-border/40 transition-colors ${
                              isRead ? "opacity-60" : "bg-accent/5"
                            }`}
                          >
                            <div className="mt-0.5 text-accent">
                              {notif.type === "task_assigned" && (
                                <CheckCircle2 size={16} className="text-green-500" />
                              )}
                              {notif.type === "marketing_deadline" && (
                                <Calendar size={16} className="text-blue-500" />
                              )}
                              {notif.type === "system_announcement" && (
                                <Megaphone size={16} className="text-accent" />
                              )}
                              {notif.type === "order_assigned" && (
                                <Package size={16} className="text-amber-500 animate-pulse" />
                              )}
                              {notif.type === "new_order" && (
                                <Package size={16} className="text-amber-500" />
                              )}
                              {notif.type === "new_field_note" && (
                                <FileText size={16} className="text-blue-500" />
                              )}
                              {notif.type === "new_quick_note" && (
                                <MessageSquare size={16} className="text-purple-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="leading-snug">{notif.message}</p>
                              <span className="text-xs text-muted mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {user?.role === "admin" && (
                    <div className="p-2 bg-card border-t border-border">
                      <button
                        onClick={() => {
                          setShowAnnouncementModal(true);
                          setNotifDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs bg-accent text-white rounded font-medium hover:bg-accent-dark transition-colors"
                      >
                        <PlusCircle size={14} />
                        Publish System Announcement
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Info (No Header Logout Button) */}
          {user?.role === "admin" && (
            <div className="text-right hidden sm:block border-l border-border pl-4">
              <div className="font-semibold text-sm leading-none">{user?.name}</div>
              <div className="text-xs text-muted mt-0.5 uppercase tracking-wider">
                {user?.role}
              </div>
            </div>
          )}

          {user?.email === "staff@ktmdecor.com" && (
            <div className="flex items-center gap-2 border-l border-border pl-4">
              <span className="text-xs font-semibold text-muted hidden md:inline uppercase tracking-wider">
                Working As:
              </span>
              <select
                value={activeStaffProfile?._id || ""}
                onChange={(e) => {
                  const selected = users.find((u) => u._id === e.target.value);
                  if (selected) setActiveStaffProfile(selected);
                }}
                className="px-2 py-1.5 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-xs font-semibold max-w-[120px] sm:max-w-[150px] transition-all cursor-pointer"
              >
                {users
                  .filter((u) => u.role !== "admin" && u.email !== "staff@ktmdecor.com")
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 overflow-x-hidden ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
        >
          <div className="flex-1 py-6 flex flex-col justify-between overflow-hidden">
            <nav className="flex-1 px-2 space-y-4 overflow-y-auto overflow-x-hidden pr-1">
              {navigationCategories.map((cat, catIdx) => (
                <div key={cat.title} className="space-y-1">
                  {sidebarOpen ? (
                    <div className="text-[10px] font-bold text-muted/65 uppercase tracking-widest px-3 mb-2 mt-4 first:mt-0 select-none">
                      {cat.title}
                    </div>
                  ) : (
                    catIdx > 0 && <div className="border-t border-border/60 my-3" />
                  )}
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all group relative ${
                          isActive
                            ? "bg-accent/10 border-accent/15 text-accent font-bold shadow-sm"
                            : "text-muted border-transparent hover:bg-border/50 hover:text-foreground"
                        }`}
                      >
                        <Icon size={20} className={isActive ? "" : "text-muted group-hover:text-foreground"} />
                        {sidebarOpen && <span>{item.label}</span>}
                        
                        {/* Tooltip when collapsed */}
                        {!sidebarOpen && (
                          <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div className="px-4 space-y-2 mb-2">
              <button
                onClick={logout}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-500/10 text-xs font-bold uppercase tracking-wider ${
                  !sidebarOpen && "aspect-square p-0"
                }`}
                title="Logout"
              >
                <LogOut size={16} className="flex-shrink-0" />
                {sidebarOpen && <span>Logout</span>}
              </button>
            </div>

            <div className="px-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="w-full flex items-center justify-center p-2.5 rounded-xl bg-border/40 text-muted hover:text-foreground hover:bg-border/80 transition-colors"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-h-[calc(100vh-4rem)] p-3 sm:p-6 md:p-8 overflow-y-auto pb-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>



      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Panel */}
          <aside className="absolute top-0 left-0 bottom-0 w-72 bg-card border-r border-border shadow-2xl flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img
                  src="/admin/logo/ktm%20decor.svg"
                  alt="KTM DECOR"
                  className="h-7 w-auto object-contain dark:invert dark:hue-rotate-180"
                />
                <span className="text-[9px] border border-accent/30 text-accent px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Menu
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-border transition-colors text-muted hover:text-foreground"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* User info */}
            <div className="px-4 py-3 border-b border-border/60">
              <div className="text-sm font-bold text-foreground">{user?.name}</div>
              <div className="text-[10px] text-muted uppercase tracking-wider mt-0.5">
                {user?.role === "admin" ? "Administrator" : "Staff Member"}
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
              {navigationCategories.map((cat) => (
                <div key={cat.title} className="space-y-1">
                  <div className="text-[10px] font-bold text-muted/65 uppercase tracking-widest px-3 mb-2 select-none">
                    {cat.title}
                  </div>
                  {cat.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                          isActive
                            ? "bg-accent text-white shadow-md shadow-accent/15"
                            : "text-muted hover:bg-border hover:text-foreground"
                        }`}
                      >
                        <Icon size={20} className={isActive ? "" : "text-muted"} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Bottom actions */}
            <div className="p-3 border-t border-border space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted hover:bg-border hover:text-foreground transition-all"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 mt-16 sm:mt-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-lg border border-border p-6 shadow-2xl animate-scale-up max-h-[calc(100vh-6rem)] sm:max-h-none overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Megaphone className="text-accent" size={20} />
                New System Announcement
              </h2>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePostAnnouncement}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  Announcement Message
                </label>
                <textarea
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  className="w-full h-24 p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none text-sm"
                  placeholder="Enter the critical announcement details here... All connected staff members will receive a live alert."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-border rounded text-sm hover:bg-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white rounded text-sm hover:bg-accent-dark transition-colors shadow-md shadow-accent/15"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
