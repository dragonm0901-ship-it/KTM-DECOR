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
  MessageSquare,
  User,
} from "./ui/solar-icons";
import {
  Search,
  Settings,
  HelpCircle,
  PanelLeftClose,
  PanelLeft,
  ChevronsUpDown,
} from "lucide-react";

interface LayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  setCurrentTab,
  children,
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
    setActiveStaffProfile,
  } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
        { id: "overview", label: "Dashboard", icon: LayoutDashboard },
        { id: "calendar", label: "Calendar", icon: Calendar },
        { id: "tasks", label: "Tasks Board", icon: CheckSquare },
        { id: "field-notes", label: "Field Notes", icon: FileText },
        {
          id: "staff-management",
          label: user?.role === "admin" ? "Staff Management" : "Attendance",
          icon: User,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        { id: "orders", label: "Orders", icon: Package },
        { id: "order-progress", label: "Order Progress", icon: Truck },
        { id: "inventory", label: "Inventory", icon: Package },
      ],
    },
    ...(user?.role === "admin"
      ? [
          {
            title: "Finance & Sales",
            items: [
              { id: "sales", label: "Sales Ledger", icon: TrendingUp },
              { id: "expenses", label: "Expenses Log", icon: DollarSign },
              { id: "purchase", label: "Purchases", icon: Briefcase },
              { id: "quotation", label: "Quotations", icon: FileText },
            ],
          },
          {
            title: "Management",
            items: [
              { id: "products", label: "Shop Catalog", icon: ShoppingBag },
              { id: "bin", label: "Trash Bin", icon: Trash2 },
            ],
          },
        ]
      : []),
  ];

  const getTabLabel = (id: string): string => {
    if (id === "overview") return "Overview";
    for (const cat of navigationCategories) {
      const found = cat.items.find((item) => item.id === id);
      if (found) return found.label;
    }
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  return (
    <div className="h-screen flex bg-background text-foreground transition-colors duration-300 overflow-hidden font-sans">
      {/* DESKTOP ASIDE (SIDEBAR) */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r border-border/70 transition-all duration-300 h-screen select-none relative z-30 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Top Header of Aside: Brand Logo + Sidebar Toggle */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border/40">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <img
                  src="/admin/logo/ktm%20decor.svg"
                  alt="KTM DECOR"
                  className="h-8 w-auto object-contain dark:invert dark:hue-rotate-180"
                />
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted hover:text-foreground transition-colors cursor-pointer"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose size={19} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 w-full">
              <div className="h-8 w-8 rounded-xl bg-accent text-white font-bold flex items-center justify-center text-xs shadow-xs">
                KD
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted hover:text-foreground transition-colors cursor-pointer"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <PanelLeft size={19} />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 py-4 px-3 space-y-3 overflow-y-auto overflow-x-hidden">
          {navigationCategories.map((cat, catIdx) => (
            <div key={cat.title} className="space-y-1">
              {sidebarOpen ? (
                <div className="text-[10px] font-bold text-muted/50 uppercase tracking-widest px-3 mb-1 mt-3 first:mt-0 select-none">
                  {cat.title}
                </div>
              ) : (
                catIdx > 0 && <div className="border-t border-border/60 my-2.5" />
              )}
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentTab(item.id)}
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
                          }
                        : undefined
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all group relative cursor-pointer ${
                      isActive
                        ? "text-black font-bold shadow-md shadow-orange-500/15"
                        : "text-muted hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                    } ${!sidebarOpen ? "justify-center px-0" : ""}`}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon
                      size={19}
                      className={`shrink-0 ${
                        isActive
                          ? "text-black"
                          : "text-muted group-hover:text-foreground"
                      }`}
                    />
                    {sidebarOpen && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Tooltip when collapsed */}
                    {!sidebarOpen && (
                      <div className="absolute left-full ml-3 px-2.5 py-1 bg-neutral-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
                        {item.label}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section: Setting, Help & Support, Workspace Pill */}
        <div className="p-3 border-t border-border/60 space-y-1">
          {/* Setting Link */}
          <button
            onClick={() => setCurrentTab("staff-management")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-muted hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all cursor-pointer ${
              !sidebarOpen ? "justify-center px-0" : ""
            }`}
            title="Setting"
          >
            <Settings size={18} className="shrink-0 text-muted" />
            {sidebarOpen && <span>Setting</span>}
          </button>

          {/* Help & Support Link */}
          <button
            onClick={() => setShowHelpModal(true)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium text-muted hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all cursor-pointer ${
              !sidebarOpen ? "justify-center px-0" : ""
            }`}
            title="Help & Support"
          >
            <HelpCircle size={18} className="shrink-0 text-muted" />
            {sidebarOpen && <span>Help & Support</span>}
          </button>

          {/* Workspace Pill Card (like Startup Inc. card in image) */}
          <div
            className={`mt-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-border/70 p-2 flex items-center justify-between gap-2.5 transition-all hover:bg-neutral-200/60 dark:hover:bg-neutral-800 select-none ${
              !sidebarOpen ? "justify-center p-1.5" : ""
            }`}
          >
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    KD
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-muted font-medium block leading-none">
                      Workspace
                    </span>
                    <span className="text-xs font-bold text-foreground block truncate leading-tight mt-0.5">
                      KTM DECOR
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={logout}
                    title="Logout"
                    className="p-1 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors cursor-pointer"
                    aria-label="Logout"
                  >
                    <LogOut size={16} />
                  </button>
                  <ChevronsUpDown size={15} className="text-muted/60" />
                </div>
              </>
            ) : (
              <button
                onClick={logout}
                title="Logout (KD Workspace)"
                className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              >
                KD
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        {/* Top Utility Bar (Integrated into Content Header) */}
        <div className="px-5 sm:px-8 pt-5 pb-3 flex items-center justify-between gap-4 flex-shrink-0">
          {/* Left: Mobile hamburger menu trigger & Dynamic Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl border border-border bg-card text-muted hover:text-foreground transition-colors cursor-pointer shrink-0"
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-foreground tracking-tight truncate">
              {getTabLabel(currentTab)}
            </h1>
          </div>

          {/* Right: Search + Notifications + Theme Toggle + User Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Staff Switcher Dropdown (for staff@ktmdecor.com) */}
            {user?.email === "staff@ktmdecor.com" && (
              <div className="hidden lg:flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs">
                <span className="text-[10px] text-muted uppercase tracking-wider">
                  Working As:
                </span>
                <select
                  value={activeStaffProfile?._id || ""}
                  onChange={(e) => {
                    const selected = users.find((u) => u._id === e.target.value);
                    if (selected) setActiveStaffProfile(selected);
                  }}
                  className="bg-transparent focus:outline-none text-xs font-semibold cursor-pointer text-foreground"
                >
                  {users
                    .filter(
                      (u) => u.role !== "admin" && u.email !== "staff@ktmdecor.com"
                    )
                    .map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Pill Search Input (identical to the image) */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card border border-border/80 text-muted shadow-2xs focus-within:border-accent/60 transition-colors w-48 md:w-60">
              <Search size={14} className="text-muted shrink-0" />
              <input
                type="text"
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-foreground placeholder:text-muted/65 focus:outline-none w-full"
              />
            </div>

            {/* Notifications Bell Button */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-border/80 bg-card transition-colors text-muted hover:text-foreground relative shadow-2xs cursor-pointer"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-badge-blink shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifDropdownOpen && (
                <div className="fixed sm:absolute top-16 sm:top-auto right-4 sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-96 max-w-[360px] glass-panel rounded-2xl shadow-2xl border border-border overflow-hidden z-50 animate-slide-up">
                  <div className="p-3.5 border-b border-border flex items-center justify-between bg-card">
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-xs text-accent hover:text-accent-dark font-medium cursor-pointer"
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
                              } else if (
                                notif.type === "marketing_deadline" ||
                                notif.type === "new_field_note"
                              ) {
                                setCurrentTab("field-notes");
                              } else if (
                                notif.type === "order_assigned" ||
                                notif.type === "new_order"
                              ) {
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
                                <CheckCircle2
                                  size={16}
                                  className="text-green-500"
                                />
                              )}
                              {notif.type === "marketing_deadline" && (
                                <Calendar size={16} className="text-blue-500" />
                              )}
                              {notif.type === "system_announcement" && (
                                <Megaphone size={16} className="text-accent" />
                              )}
                              {notif.type === "order_assigned" && (
                                <Package
                                  size={16}
                                  className="text-amber-500 animate-pulse"
                                />
                              )}
                              {notif.type === "new_order" && (
                                <Package
                                  size={16}
                                  className="text-amber-500"
                                />
                              )}
                              {notif.type === "new_field_note" && (
                                <FileText size={16} className="text-blue-500" />
                              )}
                              {notif.type === "new_quick_note" && (
                                <MessageSquare
                                  size={16}
                                  className="text-purple-500"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="leading-snug text-xs sm:text-sm">
                                {notif.message}
                              </p>
                              <span className="text-[10px] text-muted mt-1 block">
                                {new Date(notif.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {user?.role === "admin" && (
                    <div className="p-2.5 bg-card border-t border-border">
                      <button
                        onClick={() => {
                          setShowAnnouncementModal(true);
                          setNotifDropdownOpen(false);
                        }}
                        style={{
                          background:
                            "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-black font-bold rounded-xl shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                      >
                        <PlusCircle size={14} />
                        Publish System Announcement
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-border/80 bg-card transition-colors text-muted hover:text-foreground shadow-2xs cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Profile Avatar Circle (like in the image) */}
            <div
              onClick={() => {
                if (user?.role === "admin") {
                  setShowAnnouncementModal(true);
                }
              }}
              className="h-9 w-9 rounded-full bg-neutral-200 dark:bg-neutral-700 text-foreground font-bold text-xs flex items-center justify-center overflow-hidden border border-border shadow-2xs shrink-0 cursor-pointer hover:ring-2 hover:ring-accent/40 transition-all"
              title={`${user?.name || "User"} (${user?.role || "Staff"})`}
            >
              {(user as any)?.avatar ? (
                <img
                  src={(user as any).avatar}
                  alt={user?.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{user?.name?.charAt(0).toUpperCase() || "A"}</span>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Page Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pb-10">
          <div className="max-w-7xl mx-auto animate-fade-in">{children}</div>
        </main>
      </div>

      {/* MOBILE SIDEBAR DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-in Sidebar Panel */}
          <aside className="absolute top-0 left-0 bottom-0 w-72 bg-card border-r border-border shadow-2xl flex flex-col animate-slide-in-left">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <img
                  src="/admin/logo/ktm%20decor.svg"
                  alt="KTM DECOR"
                  className="h-7 w-auto object-contain dark:invert dark:hue-rotate-180"
                />
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted hover:text-foreground cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {navigationCategories.map((cat) => (
                <div key={cat.title} className="space-y-1">
                  <div className="text-[10px] font-bold text-muted/60 uppercase tracking-widest px-3 mb-1 mt-2 first:mt-0 select-none">
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
                        style={
                          isActive
                            ? {
                                background:
                                  "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
                              }
                            : undefined
                        }
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? "text-black font-bold shadow-md shadow-orange-500/20"
                            : "text-muted hover:bg-border/60 hover:text-foreground"
                        }`}
                      >
                        <Icon
                          size={19}
                          className={isActive ? "text-black" : "text-muted"}
                        />
                        <span className={isActive ? "text-black font-bold" : ""}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* Mobile Bottom Section */}
            <div className="p-3 border-t border-border space-y-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-muted hover:bg-border/60 hover:text-foreground transition-all cursor-pointer"
              >
                {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* SYSTEM ANNOUNCEMENT MODAL */}
      {showAnnouncementModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 pt-20 sm:p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Megaphone className="text-accent" size={20} />
                New System Announcement
              </h2>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-muted hover:text-foreground cursor-pointer"
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
                  className="w-full h-24 p-3 border border-border rounded-xl bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none text-sm text-foreground"
                  placeholder="Enter the critical announcement details here... All connected staff members will receive a live alert."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementModal(false)}
                  className="px-4 py-2 border border-border rounded-xl text-sm hover:bg-border transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-white font-semibold rounded-xl text-sm hover:bg-accent-dark transition-colors shadow-md shadow-accent/15 cursor-pointer"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HELP & SUPPORT MODAL */}
      {showHelpModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-3xl border border-border p-6 shadow-2xl animate-scale-up space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-accent/10 text-accent">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base font-display text-foreground">
                    Help & Support
                  </h3>
                  <p className="text-xs text-muted">KTM DECOR System Assistance</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 rounded-lg text-muted hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted">
              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-border/70 space-y-1">
                <span className="font-bold text-foreground text-xs block">
                  Support Hotline & Inquiries
                </span>
                <p>Phone: +977 9800000000</p>
                <p>Email: support@ktmdecor.com</p>
                <p>Location: Kathmandu, Nepal</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-border/70 space-y-1">
                <span className="font-bold text-foreground text-xs block">
                  Quick Navigation Shortcuts
                </span>
                <p>• Overview: Real-time KPIs, Growth Trends, Statements</p>
                <p>• Orders: Manage and track incoming client signage orders</p>
                <p>• Inventory: Monitor stock quantities and critical alerts</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs hover:bg-accent-dark transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
