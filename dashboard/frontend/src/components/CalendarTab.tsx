import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Clock,
  Package,
  FileText,
  CheckSquare,
  DollarSign,
  TrendingUp
} from "./ui/solar-icons";

interface CalendarTabProps {
  setCurrentTab: (tab: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  displayHour: number;
  type: "task" | "order" | "field-note" | "expense" | "sale";
  colorClass: string;
  textColorClass: string;
  rawObj: any;
}

export const CalendarTab: React.FC<CalendarTabProps> = ({ setCurrentTab }) => {
  const {
    tasks,
    orders,
    campaigns,
    sales,
    expenses,
    fetchSales,
    fetchExpenses,
    user
  } = useStore();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Current time tracker line state
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    // If admin, load sales and expenses logs
    if (user?.role === "admin") {
      fetchSales();
      fetchExpenses();
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const START_HOUR = 8; // 8 AM
  const END_HOUR = 18;  // 6 PM
  const ROW_HEIGHT = 64; // px

  // Calculate days of the current week (Monday - Sunday)
  const getDaysOfWeek = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday adjustment
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const daysOfWeek = getDaysOfWeek(currentDate);

  const handlePrevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // Convert all items to unified calendar events
  const buildCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // 1. Tasks
    tasks.forEach((task) => {
      const date = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
      let displayHour = date.getHours();
      // Adjust default display time if midnight or outside normal business hours
      if (displayHour < START_HOUR || displayHour > END_HOUR) {
        displayHour = 16; // 4:00 PM default
      }
      events.push({
        id: task._id,
        title: `Task: ${task.title}`,
        description: `Assignee: ${task.assignee?.name || "Unassigned"} | Priority: ${task.priority.toUpperCase()} | Status: ${task.status.toUpperCase()} | Description: ${task.description || "No description provided."}`,
        date,
        displayHour,
        type: "task",
        colorClass: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15",
        textColorClass: "text-blue-600 dark:text-blue-400",
        rawObj: task
      });
    });

    // 2. Orders (Placed on the date they were entered)
    orders.forEach((order) => {
      const entryDate = order.createdAt ? new Date(order.createdAt) : (order.date ? new Date(order.date) : new Date());
      let displayHour = entryDate.getHours();
      if (displayHour < START_HOUR || displayHour > END_HOUR) {
        displayHour = 15; // 3:00 PM default
      }
      
      const deadlineText = order.deliveryDate 
        ? new Date(order.deliveryDate).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
        : "Not specified";

      events.push({
        id: order._id,
        title: `Order: ${order.customerName} (${order.productName})`,
        description: `📅 Order Deadline: ${deadlineText}\n👤 Customer: ${order.customerName} (${order.customerContact || "No contact"})\n📦 Product: ${order.productName} (${order.size || "Standard"}, ${order.color || "Default color"})\n💰 Financials: Total Rs. ${order.totalPrice ? order.totalPrice.toLocaleString() : 0} | Due Rs. ${order.duePayment ? order.duePayment.toLocaleString() : 0}\n📌 Stage: ${order.stage ? order.stage.toUpperCase() : "PENDING"} | Source: ${order.orderFrom ? order.orderFrom.toUpperCase() : "WEBSITE"}`,
        date: entryDate,
        displayHour,
        type: "order",
        colorClass: "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/15",
        textColorClass: "text-emerald-600 dark:text-emerald-400",
        rawObj: order
      });
    });

    // 3. Field Notes / Campaigns
    campaigns.forEach((camp) => {
      const date = new Date(camp.createdAt);
      let displayHour = date.getHours();
      if (displayHour < START_HOUR || displayHour > END_HOUR) {
        displayHour = 14; // 2:00 PM default
      }
      events.push({
        id: camp._id,
        title: `Fit Note: ${camp.title}`,
        description: `District: ${camp.district} | Location: ${camp.location} | Logged By: ${camp.createdBy?.name || "Staff"} | Fitting Spot Details: ${camp.description}`,
        date,
        displayHour,
        type: "field-note",
        colorClass: "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15",
        textColorClass: "text-amber-600 dark:text-amber-400",
        rawObj: camp
      });
    });

    // 4. Expenses (Admin only)
    if (user?.role === "admin") {
      expenses.forEach((expense) => {
        const date = new Date(expense.date);
        events.push({
          id: expense._id,
          title: `Expense: Rs. ${expense.amount.toLocaleString()} - ${expense.title}`,
          description: `Category: ${expense.category} | Logged: ${date.toLocaleDateString()} | Description: ${expense.description || "No description logged."}`,
          date,
          displayHour: 11, // 11:00 AM default
          type: "expense",
          colorClass: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15",
          textColorClass: "text-red-600 dark:text-red-400",
          rawObj: expense
        });
      });

      // 5. Sales (Admin only)
      sales.forEach((sale) => {
        const date = new Date(sale.date);
        events.push({
          id: sale._id,
          title: `Sale: Rs. ${sale.amount.toLocaleString()} - ${sale.clientName}`,
          description: `Product: ${sale.productName} | Payment: ${sale.paymentMethod.toUpperCase()} | Notes: ${sale.notes || "No notes details."}`,
          date,
          displayHour: 12, // 12:00 PM default
          type: "sale",
          colorClass: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/15",
          textColorClass: "text-purple-600 dark:text-purple-400",
          rawObj: sale
        });
      });
    }

    return events;
  };

  const allEvents = buildCalendarEvents();

  // Filter events by search query and week range
  const weekStartTimestamp = daysOfWeek[0].getTime();
  const weekEndTimestamp = daysOfWeek[6].getTime() + 24 * 60 * 60 * 1000;

  const filteredEvents = allEvents.filter((ev) => {
    const matchesSearch = ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.description.toLowerCase().includes(searchQuery.toLowerCase());
    const evTime = ev.date.getTime();
    const isInWeek = evTime >= weekStartTimestamp && evTime <= weekEndTimestamp;
    return matchesSearch && isInWeek;
  });

  // Group events by day and hour slot to compute offsets and width division
  const slotGroups: Record<string, CalendarEvent[]> = {};
  filteredEvents.forEach((ev) => {
    const evHour = ev.displayHour;
    if (evHour < START_HOUR || evHour > END_HOUR) return;
    const dayNum = ev.date.getDay();
    const colIdx = dayNum === 0 ? 6 : dayNum - 1;
    const key = `${colIdx}-${evHour}`;
    if (!slotGroups[key]) {
      slotGroups[key] = [];
    }
    slotGroups[key].push(ev);
  });

  // Render header values
  const monthAbbr = currentDate.toLocaleDateString([], { month: "short" });
  const dayOfMonth = currentDate.getDate();
  const monthYearStr = currentDate.toLocaleDateString([], { month: "long", year: "numeric" });
  
  const weekRangeStr = `${daysOfWeek[0].toLocaleDateString([], {
    month: "short",
    day: "numeric"
  })} - ${daysOfWeek[6].toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  const formatHour = (h: number) => {
    const suffix = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour} ${suffix}`;
  };

  // Determine current day red tracker position
  const isCurrentWeek = now.getTime() >= weekStartTimestamp && now.getTime() <= weekEndTimestamp;
  const currentHourNow = now.getHours();
  const currentMinNow = now.getMinutes();
  const redLineTop = ((currentHourNow - START_HOUR) + currentMinNow / 60) * ROW_HEIGHT;
  const isRedLineVisible = isCurrentWeek && currentHourNow >= START_HOUR && currentHourNow < END_HOUR;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 transition-all">
        {/* Left: Date Badge */}
        <div className="flex items-center gap-3">
          <div className="bg-foreground text-background dark:bg-accent dark:text-white px-3.5 py-2 rounded-xl flex flex-col items-center justify-center min-w-[64px] shadow-sm select-none">
            <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none opacity-85">{monthAbbr}</span>
            <span className="text-2xl font-extrabold leading-none mt-1">{dayOfMonth}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold font-display leading-tight">{monthYearStr}</h1>
            <p className="text-xs text-muted font-bold tracking-wider uppercase mt-0.5">{weekRangeStr}</p>
          </div>
        </div>

        {/* Center: Navigation controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 bg-muted/20 border border-border/80 p-1 rounded-xl">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 rounded-lg hover:bg-card text-muted hover:text-foreground transition-all"
              aria-label="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleGoToday}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-card text-foreground shadow-sm hover:bg-muted/10 transition-all"
            >
              Today
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1.5 rounded-lg hover:bg-card text-muted hover:text-foreground transition-all"
              aria-label="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Color Indicators Legend */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Tasks</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Fitting Notes</span>
            </div>
            {user?.role === "admin" && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Sales</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Search filter */}
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search calendar events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold"
          />
        </div>
      </div>

      {/* CALENDAR WEEK GRID CONTAINER */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden p-2 sm:p-5">
        <div className="w-full min-w-0 md:min-w-[800px] overflow-x-auto">
          {/* Day Grid Header */}
          <div className="flex border-b border-border/60 pb-3">
            <div className="w-10 sm:w-16 flex-shrink-0" /> {/* Time column blank */}
            {daysOfWeek.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={idx} className="flex-1 text-center select-none">
                  <span className="text-[8px] sm:text-[10px] font-bold text-muted uppercase tracking-widest block">
                    {day.toLocaleDateString([], { weekday: "short" })}
                  </span>
                  <span className={`mt-1 inline-flex items-center justify-center h-6 w-6 sm:h-8 sm:w-8 rounded-full text-[9px] sm:text-xs font-extrabold ${
                    isToday
                      ? "bg-foreground text-background dark:bg-accent dark:text-white shadow-sm"
                      : "text-foreground"
                  }`}>
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Time & Event Grid body */}
          <div className="relative mt-2" style={{ height: `${hours.length * ROW_HEIGHT}px` }}>
            {/* Horizontal Grid Row Lines */}
            {hours.map((hour, hourIdx) => {
              const topVal = hourIdx * ROW_HEIGHT;
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex border-b border-border/40"
                  style={{ top: `${topVal}px`, height: `${ROW_HEIGHT}px` }}
                >
                  {/* Hour text label */}
                  <div className="w-10 sm:w-16 pr-1 sm:pr-3 -mt-2 text-right text-[8px] sm:text-[10px] font-extrabold text-muted/60 uppercase select-none truncate">
                    {formatHour(hour)}
                  </div>
                  {/* Read-only day slots */}
                  {daysOfWeek.map((_, dayIdx) => (
                    <div
                      key={dayIdx}
                      className="flex-1 border-l border-border/40"
                    />
                  ))}
                </div>
              );
            })}

            {/* Absolute Event Cards Layer */}
            <div className="absolute inset-0 pl-10 sm:pl-16 pointer-events-none">
              <div className="relative w-full h-full">
                {filteredEvents.map((ev) => {
                  const evDate = ev.date;
                  const evHour = ev.displayHour; // Use mapped display hour
                  
                  // Filter out if outside hour grid bounds
                  if (evHour < START_HOUR || evHour > END_HOUR) return null;

                  // Find column index (0 = Monday, 6 = Sunday)
                  const dayNum = evDate.getDay();
                  const colIdx = dayNum === 0 ? 6 : dayNum - 1;

                  const key = `${colIdx}-${evHour}`;
                  const slotEvents = slotGroups[key] || [ev];
                  const eventIdxInSlot = slotEvents.findIndex(item => item.id === ev.id && item.type === ev.type);
                  const slotCount = slotEvents.length;

                  const cardTop = (evHour - START_HOUR) * ROW_HEIGHT;
                  const baseWidth = 100 / 7;
                  const finalWidth = baseWidth / slotCount;
                  const cardLeft = ((colIdx / 7) * 100) + (eventIdxInSlot * finalWidth);

                  const timeStr = evDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div
                      key={`${ev.type}-${ev.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(ev);
                      }}
                      className={`absolute pointer-events-auto cursor-pointer p-1 sm:p-2 rounded-lg sm:rounded-xl border flex flex-col justify-between transition-all duration-200 hover:scale-[1.02] hover:shadow-md hover:z-10 group select-none ${ev.colorClass}`}
                      style={{
                        top: `${cardTop + 4}px`,
                        left: `calc(${cardLeft}% + 2px)`,
                        width: `calc(${finalWidth}% - 4px)`,
                        height: `${ROW_HEIGHT - 8}px`
                      }}
                    >
                      <div className="overflow-hidden">
                        <span className={`text-[7px] sm:text-[9px] font-extrabold flex items-center gap-0.5 sm:gap-1 ${ev.textColorClass}`}>
                          {ev.type === "task" && <CheckSquare size={8} className="sm:w-2.5 sm:h-2.5" />}
                          {ev.type === "order" && <Package size={8} className="sm:w-2.5 sm:h-2.5" />}
                          {ev.type === "field-note" && <FileText size={8} className="sm:w-2.5 sm:h-2.5" />}
                          {ev.type === "expense" && <DollarSign size={8} className="sm:w-2.5 sm:h-2.5" />}
                          {ev.type === "sale" && <TrendingUp size={8} className="sm:w-2.5 sm:h-2.5" />}
                          <span className="truncate">{timeStr}</span>
                        </span>
                        <h4 className="text-[7px] sm:text-[10px] font-bold text-foreground leading-tight mt-0.5 truncate group-hover:text-accent transition-colors">
                          {ev.title}
                        </h4>
                      </div>
                      <span className="text-[6px] sm:text-[8px] text-muted truncate opacity-80 uppercase">
                        {ev.type === "field-note" ? "FIT NOTE" : ev.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Red Current Time Line Indicator */}
            {isRedLineVisible && (
              <div
                className="absolute left-0 right-0 flex items-center pointer-events-none z-10"
                style={{ top: `${redLineTop}px` }}
              >
                <div className="w-10 sm:w-16 text-right pr-1 sm:pr-2 text-[7px] sm:text-[9px] font-extrabold text-red-500 bg-card rounded p-0.5 shadow-sm border border-red-500/10 select-none truncate">
                  {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="flex-1 border-t-2 border-dotted border-red-500 relative">
                  <div className="absolute left-0 -top-1 h-2 w-2 rounded-full bg-red-500 shadow shadow-red-500/50" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EVENT DETAILS VIEW POPUP */}
      {selectedEvent && (
        <div className="modal-overlay fixed inset-0 bg-background/80 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-4 pt-20 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border/80 w-full max-w-md rounded-2xl shadow-xl p-6 relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-border text-muted hover:text-foreground transition-all"
            >
              <X size={18} />
            </button>

            <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-muted/20 ${selectedEvent.textColorClass}`}>
              {selectedEvent.type === "field-note" ? "Fitting Note" : selectedEvent.type}
            </span>

            <h3 className="font-bold text-base font-display mt-4 leading-tight">{selectedEvent.title}</h3>
            
            <div className="flex items-center gap-1.5 text-xs text-muted font-semibold mt-2">
              <Clock size={14} />
              <span>{selectedEvent.date.toLocaleString()}</span>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-border/80 bg-muted/5 text-xs text-muted leading-relaxed whitespace-pre-wrap">
              {selectedEvent.description}
            </div>

            <div className="mt-6 flex justify-between gap-2.5">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  if (selectedEvent.type === "task") setCurrentTab("tasks");
                  if (selectedEvent.type === "order") setCurrentTab("order-progress");
                  if (selectedEvent.type === "field-note") setCurrentTab("field-notes");
                  if (selectedEvent.type === "expense") setCurrentTab("expenses");
                  if (selectedEvent.type === "sale") setCurrentTab("sales");
                }}
                className="flex-1 px-4 py-2 bg-accent/10 border border-accent/20 text-accent rounded-xl font-bold text-xs hover:bg-accent/25 transition-all text-center"
              >
                Go to Workspace
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted/30 transition-all text-muted hover:text-foreground text-center"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
