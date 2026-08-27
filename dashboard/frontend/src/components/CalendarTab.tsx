import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Clock,
} from "./ui/solar-icons";
import {
  formatNepali,
  formatNepaliWithTime,
  getCurrentNepaliDate,
  NEPALI_MONTHS,
  NEPALI_DAYS,
  getDaysInBsMonth,
  getFirstDayOfBsMonth,
  adToBs,
} from "../utils/nepaliDate";

interface CalendarTabProps {
  setCurrentTab: (tab: string) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  bsYear: number;
  bsMonth: number; // 1-12
  bsDay: number;
  displayHour: number;
  type: "task" | "order" | "field-note" | "expense" | "sale";
  colorClass: string;
  textColorClass: string;
  badgeClass: string;
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
    user,
  } = useStore();

  const currentBsToday = getCurrentNepaliDate();
  const [bsYear, setBsYear] = useState<number>(currentBsToday.year);
  const [bsMonth, setBsMonth] = useState<number>(currentBsToday.month); // 1-12
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [weekOffsetDays, setWeekOffsetDays] = useState<number>(0); // 0 = current week
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: CalendarEvent[] } | null>(null);

  // Current time tracker line state
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    // If admin, load sales and expenses logs
    if (user?.role === "admin") {
      fetchSales();
      fetchExpenses();
    }
  }, [user, fetchSales, fetchExpenses]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const START_HOUR = 8; // 8 AM
  const END_HOUR = 18; // 6 PM
  const ROW_HEIGHT = 64; // px

  const currentMonthInfo = NEPALI_MONTHS[bsMonth - 1] || NEPALI_MONTHS[0];

  const handlePrev = () => {
    if (viewMode === "month") {
      if (bsMonth === 1) {
        setBsMonth(12);
        setBsYear((prev) => prev - 1);
      } else {
        setBsMonth((prev) => prev - 1);
      }
    } else {
      setWeekOffsetDays((prev) => prev - 7);
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      if (bsMonth === 12) {
        setBsMonth(1);
        setBsYear((prev) => prev + 1);
      } else {
        setBsMonth((prev) => prev + 1);
      }
    } else {
      setWeekOffsetDays((prev) => prev + 7);
    }
  };

  const handleGoToday = () => {
    const today = getCurrentNepaliDate();
    setBsYear(today.year);
    setBsMonth(today.month);
    setWeekOffsetDays(0);
  };

  // Convert all items to unified calendar events with precise BS coordinates
  const buildCalendarEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];

    // 1. Tasks
    tasks.forEach((task) => {
      const date = task.dueDate ? new Date(task.dueDate) : new Date(task.createdAt);
      if (isNaN(date.getTime())) return;
      const bs = adToBs(date);
      let displayHour = date.getHours();
      if (displayHour < START_HOUR || displayHour > END_HOUR) displayHour = 16;

      events.push({
        id: task._id,
        title: `Task: ${task.title}`,
        description: `Assignee: ${task.assignee?.name || "Unassigned"} | Priority: ${task.priority.toUpperCase()} | Status: ${task.status.toUpperCase()} | Details: ${task.description || "No description."}`,
        date,
        bsYear: bs.year,
        bsMonth: bs.month,
        bsDay: bs.day,
        displayHour,
        type: "task",
        colorClass: "bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-xs",
        textColorClass: "text-blue-600 dark:text-blue-400",
        badgeClass: "bg-blue-600 text-white font-bold",
        rawObj: task,
      });
    });

    // 2. Orders (Placed / target delivery date)
    orders.forEach((order) => {
      if (order.deleted) return;
      const date = order.deliveryDate ? new Date(order.deliveryDate) : new Date(order.createdAt);
      if (isNaN(date.getTime())) return;
      const bs = adToBs(date);
      let displayHour = date.getHours();
      if (displayHour < START_HOUR || displayHour > END_HOUR) displayHour = 15;

      const deadlineText = formatNepali(date);

      events.push({
        id: order._id,
        title: `Order: ${order.customerName} (${order.productName})`,
        description: `📅 BS Delivery: ${deadlineText}\n👤 Customer: ${order.customerName} (${order.customerContact || "No contact"})\n📦 Item: ${order.productName} (${order.size || "Standard"}, ${order.color || "Color"})\n💰 Total: Rs. ${order.totalPrice ? order.totalPrice.toLocaleString() : 0} | Due: Rs. ${order.duePayment ? order.duePayment.toLocaleString() : 0}\n📌 Stage: ${order.stage?.toUpperCase() || "PENDING"}`,
        date,
        bsYear: bs.year,
        bsMonth: bs.month,
        bsDay: bs.day,
        displayHour,
        type: "order",
        colorClass: "bg-emerald-600 text-white hover:bg-emerald-700 font-bold shadow-xs",
        textColorClass: "text-emerald-600 dark:text-emerald-400",
        badgeClass: "bg-emerald-600 text-white font-bold",
        rawObj: order,
      });
    });

    // 3. Field Notes / Campaigns
    campaigns.forEach((camp) => {
      const date = new Date(camp.createdAt);
      if (isNaN(date.getTime())) return;
      const bs = adToBs(date);
      let displayHour = date.getHours();
      if (displayHour < START_HOUR || displayHour > END_HOUR) displayHour = 14;

      events.push({
        id: camp._id,
        title: `Fit Note: ${camp.title}`,
        description: `District: ${camp.district} | Location: ${camp.location} | Logged By: ${camp.createdBy?.name || "Staff"}\nFitting Details: ${camp.description}`,
        date,
        bsYear: bs.year,
        bsMonth: bs.month,
        bsDay: bs.day,
        displayHour,
        type: "field-note",
        colorClass: "bg-amber-600 text-white hover:bg-amber-700 font-bold shadow-xs",
        textColorClass: "text-amber-600 dark:text-amber-400",
        badgeClass: "bg-amber-600 text-white font-bold",
        rawObj: camp,
      });
    });

    // 4. Expenses (Admin only)
    if (user?.role === "admin") {
      expenses.forEach((expense) => {
        const date = new Date(expense.date);
        if (isNaN(date.getTime())) return;
        const bs = adToBs(date);

        events.push({
          id: expense._id,
          title: `Expense: Rs. ${expense.amount.toLocaleString()} - ${expense.title}`,
          description: `Category: ${expense.category.toUpperCase()} | Date: ${formatNepali(date)} | Details: ${expense.description || "None"}`,
          date,
          bsYear: bs.year,
          bsMonth: bs.month,
          bsDay: bs.day,
          displayHour: 11,
          type: "expense",
          colorClass: "bg-red-600 text-white hover:bg-red-700 font-bold shadow-xs",
          textColorClass: "text-red-600 dark:text-red-400",
          badgeClass: "bg-red-600 text-white font-bold",
          rawObj: expense,
        });
      });

      // 5. Sales (Admin only)
      sales.forEach((sale) => {
        const date = new Date(sale.date);
        if (isNaN(date.getTime())) return;
        const bs = adToBs(date);

        events.push({
          id: sale._id,
          title: `Sale: Rs. ${sale.amount.toLocaleString()} - ${sale.clientName}`,
          description: `Client: ${sale.clientName} | Product: ${sale.productName} | Payment: ${sale.paymentMethod.toUpperCase()} | Notes: ${sale.notes || "None"}`,
          date,
          bsYear: bs.year,
          bsMonth: bs.month,
          bsDay: bs.day,
          displayHour: 12,
          type: "sale",
          colorClass: "bg-purple-600 text-white hover:bg-purple-700 font-bold shadow-xs",
          textColorClass: "text-purple-600 dark:text-purple-400",
          badgeClass: "bg-purple-600 text-white font-bold",
          rawObj: sale,
        });
      });
    }

    return events;
  };

  const allEvents = buildCalendarEvents();

  // Search filter
  const filteredEvents = allEvents.filter((ev) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return ev.title.toLowerCase().includes(q) || ev.description.toLowerCase().includes(q);
  });

  // Calculate days for the BS Month View
  const daysInBsMonth = getDaysInBsMonth(bsYear, bsMonth);
  const firstDayOfWeekBsMonth = getFirstDayOfBsMonth(bsYear, bsMonth); // 0 = Sun

  // Calculate days for the BS Week View (7 days starting from Sunday)
  const getWeekDays = () => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + weekOffsetDays);
    const dayOfWeek = baseDate.getDay(); // 0 = Sunday
    const sunday = new Date(baseDate);
    sunday.setDate(baseDate.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const bs = adToBs(d);
      days.push({
        adDate: d,
        bsYear: bs.year,
        bsMonth: bs.month,
        bsDay: bs.day,
        monthName: bs.monthName,
        dayOfWeek: i,
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const weekStartBs = weekDays[0];
  const weekEndBs = weekDays[6];

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  const formatHour = (h: number) => {
    const suffix = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour} ${suffix}`;
  };

  // Determine current day red tracker position in week view
  const weekStartTs = weekDays[0].adDate.getTime();
  const weekEndTs = weekDays[6].adDate.getTime() + 24 * 3600 * 1000;
  const isCurrentWeek = now.getTime() >= weekStartTs && now.getTime() <= weekEndTs;
  const currentHourNow = now.getHours();
  const currentMinNow = now.getMinutes();
  const redLineTop = (currentHourNow - START_HOUR + currentMinNow / 60) * ROW_HEIGHT;
  const isRedLineVisible = isCurrentWeek && currentHourNow >= START_HOUR && currentHourNow < END_HOUR;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 transition-all">
        {/* Left: Nepali Date Badge & Title */}
        <div className="flex items-center gap-3.5">
          <div className="bg-foreground text-background dark:bg-accent dark:text-white px-4 py-2.5 rounded-xl flex flex-col items-center justify-center min-w-[70px] shadow-sm select-none">
            <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none opacity-85">
              {currentMonthInfo.short}
            </span>
            <span className="text-2xl font-extrabold leading-none mt-1">
              {currentBsToday.year === bsYear && currentBsToday.month === bsMonth
                ? currentBsToday.day
                : "BS"}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold font-display leading-tight">
                {currentMonthInfo.name} {bsYear}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-md bg-accent/10 text-accent font-bold">
                {currentMonthInfo.nepaliName} {bsYear}
              </span>
            </div>
            <p className="text-xs text-muted font-bold tracking-wider uppercase mt-1">
              {viewMode === "month"
                ? `Nepali Calendar • ${daysInBsMonth} Days`
                : `${weekStartBs.monthName} ${weekStartBs.bsDay} – ${weekEndBs.monthName} ${weekEndBs.bsDay}, ${weekEndBs.bsYear} BS`}
            </p>
          </div>
        </div>

        {/* Center: Navigation Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Switcher: Month / Week */}
          <div className="flex items-center bg-muted/20 border border-border/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === "month"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Month (मासिक)
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === "week"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Week (साप्ताहिक)
            </button>
          </div>

          {/* Month / Week Nav buttons */}
          <div className="flex items-center gap-1 bg-muted/20 border border-border/80 p-1 rounded-xl">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-card text-muted hover:text-foreground transition-all"
              aria-label="Previous"
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
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-card text-muted hover:text-foreground transition-all"
              aria-label="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Color Indicators Legend */}
          <div className="hidden lg:flex items-center gap-x-3 text-[10px] font-bold uppercase tracking-wider text-muted">
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
              <span>Fitting</span>
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

        {/* Right: Search Filter */}
        <div className="relative w-full xl:max-w-xs">
          <Search className="absolute left-3.5 top-2.5 text-muted" size={16} />
          <input
            type="text"
            placeholder="Search Nepali calendar events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold"
          />
        </div>
      </div>

      {/* VIEW 1: NEPALI MONTH VIEW (FULL 7-COLUMN BS GRID) */}
      {viewMode === "month" && (
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-border/70 bg-muted/10">
            {NEPALI_DAYS.map((d, idx) => (
              <div
                key={d.short}
                className={`py-3 px-2 text-center border-r last:border-r-0 border-border/40 ${
                  idx === 6 ? "bg-amber-500/5 text-amber-600 dark:text-amber-400" : "text-muted"
                }`}
              >
                <span className="text-xs font-extrabold uppercase tracking-wider block">{d.name}</span>
                <span className="text-[10px] font-bold opacity-80 block">{d.nepaliShort}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr">
            {/* Preceding Empty Slots */}
            {Array.from({ length: firstDayOfWeekBsMonth }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[90px] sm:min-h-[115px] border-b border-r border-border/30 bg-muted/5 opacity-30"
              />
            ))}

            {/* Days of BS Month */}
            {Array.from({ length: daysInBsMonth }).map((_, i) => {
              const day = i + 1;
              const dayOfWeek = (firstDayOfWeekBsMonth + i) % 7;
              const isSaturday = dayOfWeek === 6;

              const isToday =
                currentBsToday.year === bsYear &&
                currentBsToday.month === bsMonth &&
                currentBsToday.day === day;

              // Find events on this exact BS day
              const dayEvents = filteredEvents.filter(
                (ev) => ev.bsYear === bsYear && ev.bsMonth === bsMonth && ev.bsDay === day
              );

              return (
                <div
                  key={`day-${day}`}
                  className={`min-h-[90px] sm:min-h-[115px] p-2 border-b border-r border-border/40 flex flex-col justify-between transition-colors group relative ${
                    isSaturday ? "bg-amber-500/[0.02]" : "bg-card"
                  } ${isToday ? "bg-accent/5 ring-1 ring-inset ring-accent/30" : "hover:bg-muted/10"}`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                        isToday
                          ? "bg-accent text-white"
                          : isSaturday
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedDayEvents({ day, events: dayEvents })}
                        className="text-[10px] font-extrabold text-muted hover:text-foreground bg-muted/20 px-1.5 py-0.5 rounded-md transition-colors"
                      >
                        {dayEvents.length} {dayEvents.length === 1 ? "item" : "items"}
                      </button>
                    )}
                  </div>

                  {/* Day Events Stack */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`px-1.5 py-1 rounded-lg text-[10px] font-bold border truncate cursor-pointer transition-transform hover:scale-[1.02] shadow-xs ${ev.colorClass}`}
                        title={`${ev.title}\n${ev.description}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setSelectedDayEvents({ day, events: dayEvents })}
                        className="text-[9px] font-bold text-accent hover:underline block w-full text-left pt-0.5"
                      >
                        +{dayEvents.length - 3} more...
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: NEPALI WEEK TIMETABLE VIEW */}
      {viewMode === "week" && (
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Header Row: Days of Week */}
          <div className="grid grid-cols-8 border-b border-border/70 bg-muted/10 sticky top-0 z-20">
            {/* Time Column Header */}
            <div className="py-3 px-2 text-center border-r border-border/40 text-muted font-bold text-xs flex items-center justify-center">
              <Clock size={15} />
            </div>

            {weekDays.map((d) => {
              const isSaturday = d.dayOfWeek === 6;
              const isToday =
                currentBsToday.year === d.bsYear &&
                currentBsToday.month === d.bsMonth &&
                currentBsToday.day === d.bsDay;

              return (
                <div
                  key={d.dayOfWeek}
                  className={`py-3 px-2 text-center border-r last:border-r-0 border-border/40 ${
                    isSaturday ? "bg-amber-500/5 text-amber-600 dark:text-amber-400" : "text-muted"
                  } ${isToday ? "bg-accent/5 font-black" : ""}`}
                >
                  <span className="text-[11px] font-extrabold uppercase tracking-wider block">
                    {NEPALI_DAYS[d.dayOfWeek].name}
                  </span>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span
                      className={`text-xs font-black px-1.5 py-0.5 rounded-md ${
                        isToday ? "bg-accent text-white" : "text-foreground"
                      }`}
                    >
                      {d.bsDay}
                    </span>
                    <span className="text-[10px] text-muted font-bold">{d.monthName}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week Hours Grid */}
          <div className="relative overflow-y-auto max-h-[600px]">
            {/* Red Live Tracker Line */}
            {isRedLineVisible && (
              <div
                className="absolute left-[12.5%] right-0 border-t-2 border-red-500 z-30 pointer-events-none flex items-center shadow-sm"
                style={{ top: `${redLineTop}px` }}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 -ml-1.5 ring-2 ring-white dark:ring-zinc-900" />
                <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md ml-1 shadow-sm">
                  NOW
                </span>
              </div>
            )}

            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 border-b border-border/40"
                style={{ height: `${ROW_HEIGHT}px` }}
              >
                {/* Hour Label */}
                <div className="border-r border-border/40 p-2 text-right text-[11px] font-bold text-muted select-none flex items-start justify-end">
                  {formatHour(hour)}
                </div>

                {/* 7 Day Slot Cells */}
                {weekDays.map((d) => {
                  // Find events matching this BS date and hour
                  const slotEvents = filteredEvents.filter(
                    (ev) =>
                      ev.bsYear === d.bsYear &&
                      ev.bsMonth === d.bsMonth &&
                      ev.bsDay === d.bsDay &&
                      ev.displayHour === hour
                  );

                  return (
                    <div
                      key={`${d.dayOfWeek}-${hour}`}
                      className={`border-r last:border-r-0 border-border/30 p-1 relative group hover:bg-muted/10 transition-colors ${
                        d.dayOfWeek === 6 ? "bg-amber-500/[0.02]" : ""
                      }`}
                    >
                      {slotEvents.map((ev) => (
                        <div
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`p-1.5 rounded-lg border text-[10px] font-bold cursor-pointer truncate shadow-xs transition-transform hover:scale-[1.02] mb-1 ${ev.colorClass}`}
                          title={`${ev.title}\n${ev.description}`}
                        >
                          {ev.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${selectedEvent.badgeClass}`}>
                {selectedEvent.type.replace("-", " ")}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-base font-extrabold text-foreground">{selectedEvent.title}</h3>
              <p className="text-xs text-accent font-bold mt-1">
                📅 Nepali Date: {formatNepaliWithTime(selectedEvent.date)}
              </p>
            </div>

            <div className="p-3.5 bg-muted/15 rounded-xl border border-border/60 text-xs font-medium text-foreground whitespace-pre-line leading-relaxed">
              {selectedEvent.description}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (selectedEvent.type === "order") setCurrentTab("orders");
                  if (selectedEvent.type === "task") setCurrentTab("tasks");
                  if (selectedEvent.type === "field-note") setCurrentTab("field-notes");
                  if (selectedEvent.type === "expense") setCurrentTab("expenses");
                  if (selectedEvent.type === "sale") setCurrentTab("sales");
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 bg-accent text-white font-bold rounded-xl text-xs hover:bg-accent/90 transition-all shadow-sm"
              >
                Go to {selectedEvent.type.replace("-", " ")} Tab
              </button>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 border border-border bg-card text-foreground font-bold rounded-xl text-xs hover:bg-muted/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DAY EVENTS LIST MODAL */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  Events on {currentMonthInfo.name} {selectedDayEvents.day}, {bsYear} BS
                </h3>
                <p className="text-xs text-muted font-semibold">
                  {currentMonthInfo.nepaliName} {selectedDayEvents.day}, {bsYear}
                </p>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="p-1 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {selectedDayEvents.events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedDayEvents(null);
                    setSelectedEvent(ev);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all hover:scale-[1.01] ${ev.colorClass}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${ev.badgeClass}`}>
                      {ev.type}
                    </span>
                    <span className="text-[10px] font-bold text-muted">
                      {formatNepaliWithTime(ev.date).split("at ")[1] || ""}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-foreground">{ev.title}</h4>
                  <p className="text-[11px] text-muted mt-1 truncate">{ev.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedDayEvents(null)}
                className="px-4 py-2 border border-border bg-card text-foreground font-bold rounded-xl text-xs hover:bg-muted/20 transition-all"
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
