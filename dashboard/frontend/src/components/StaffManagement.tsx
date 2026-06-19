import React, { useState, useEffect } from "react";
import { useStore, Attendance, User as StoreUser } from "../store/useStore";
import {
  Calendar,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  DollarSign,
  TrendingUp,
  User as UserIcon,
  CheckCircle2,
  FileText
} from "./ui/solar-icons";

export const StaffManagement: React.FC = () => {
  const {
    user,
    activeStaffProfile,
    users,
    attendanceLogs,
    fetchUsers,
    fetchAttendanceLogs,
    logAttendance,
    updateAttendance,
    deleteAttendance
  } = useStore();

  // Active staff member (supports direct login or shared staff login persona)
  const getActiveStaff = (): StoreUser | null => {
    if (user?.role === "admin") return null;
    if (user?.email === "staff@ktmdecor.com") {
      return activeStaffProfile;
    }
    return user;
  };

  const activeStaff = getActiveStaff();
  const isAdmin = user?.role === "admin";

  // Tab State (for admin)
  const [adminTab, setAdminTab] = useState<"payroll" | "calendar" | "bulk">("payroll");

  // Selected Date Filter State (defaulting to current date)
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedAdminStaffId, setSelectedAdminStaffId] = useState<string>("");
  const [selectedDayNum, setSelectedDayNum] = useState<number>(new Date().getDate());
  const [activityDate, setActivityDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Modal / Form States
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<Attendance | null>(null);
  const [modalDate, setModalDate] = useState<Date>(new Date());
  const [modalUserId, setModalUserId] = useState<string>("");
  const [modalStatus, setModalStatus] = useState<"present" | "absent" | "half_day" | "leave">("present");
  const [modalCheckIn, setModalCheckIn] = useState<string>("");
  const [modalCheckOut, setModalCheckOut] = useState<string>("");
  const [modalNotes, setModalNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Bulk logging state
  const [bulkDate, setBulkDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [bulkStatusMap, setBulkStatusMap] = useState<Record<string, "present" | "absent" | "half_day" | "leave">>({});
  const [bulkNotesMap, setBulkNotesMap] = useState<Record<string, string>>({});
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState<string>("");

  // Year list
  const years = [2025, 2026, 2027];
  // Month list
  const months = [
    { value: 1, name: "January" },
    { value: 2, name: "February" },
    { value: 3, name: "March" },
    { value: 4, name: "April" },
    { value: 5, name: "May" },
    { value: 6, name: "June" },
    { value: 7, name: "July" },
    { value: 8, name: "August" },
    { value: 9, name: "September" },
    { value: 10, name: "October" },
    { value: 11, name: "November" },
    { value: 12, name: "December" }
  ];

  // Fetch initial data
  useEffect(() => {
    fetchUsers();
  }, []);

  // Set default admin selected staff
  useEffect(() => {
    const staffList = users.filter(u => u.role === "staff" && u.email !== "staff@ktmdecor.com");
    if (staffList.length > 0 && !selectedAdminStaffId) {
      setSelectedAdminStaffId(staffList[0]._id);
    }
  }, [users]);

  // Clamp selectedDayNum when month/year changes
  useEffect(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    if (selectedDayNum > daysInMonth) {
      setSelectedDayNum(daysInMonth);
    }
  }, [selectedMonth, selectedYear]);

  // Sync selectedMonth and selectedYear with activityDate selection
  useEffect(() => {
    const d = new Date(activityDate);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    if (m !== selectedMonth || y !== selectedYear) {
      setSelectedMonth(m);
      setSelectedYear(y);
    }
  }, [activityDate]);

  // Fetch attendance logs when filter selections change
  useEffect(() => {
    if (isAdmin) {
      if (adminTab === "payroll") {
        // Fetch all attendance logs for the month to calculate payroll
        fetchAttendanceLogs(undefined, selectedMonth, selectedYear);
      } else if (adminTab === "calendar" && selectedAdminStaffId) {
        // Fetch logs for the specific staff member
        fetchAttendanceLogs(selectedAdminStaffId, selectedMonth, selectedYear);
      }
    } else if (activeStaff) {
      // Fetch current staff's logs
      fetchAttendanceLogs(activeStaff._id, selectedMonth, selectedYear);
    }
  }, [isAdmin, adminTab, activeStaff?.email, activeStaff?._id, selectedAdminStaffId, selectedMonth, selectedYear]);

  // Bulk state initialization when users load
  useEffect(() => {
    const staffList = users.filter(u => u.role === "staff" && u.email !== "staff@ktmdecor.com");
    const initialStatuses: Record<string, "present" | "absent" | "half_day" | "leave"> = {};
    const initialNotes: Record<string, string> = {};
    staffList.forEach(s => {
      initialStatuses[s._id] = "present";
      initialNotes[s._id] = "";
    });
    setBulkStatusMap(initialStatuses);
    setBulkNotesMap(initialNotes);
  }, [users]);

  // Help calculate weekdays in Nepal (Sunday through Friday, Saturday off)
  const getWorkingDaysInMonth = (year: number, month: number): number => {
    const date = new Date(year, month - 1, 1);
    let count = 0;
    while (date.getMonth() === month - 1) {
      const day = date.getDay();
      if (day !== 6) { // 6 is Saturday (Nepal weekend)
        count++;
      }
      date.setDate(date.getDate() + 1);
    }
    return count;
  };

  // Find attendance record matching a day
  const getLogForDay = (day: number): Attendance | undefined => {
    return attendanceLogs.find(log => {
      const logDate = new Date(log.date);
      return (
        logDate.getUTCDate() === day &&
        logDate.getUTCMonth() + 1 === selectedMonth &&
        logDate.getUTCFullYear() === selectedYear
      );
    });
  };

  // Find attendance record matching a specific user and date string (YYYY-MM-DD)
  const getLogForUserOnDate = (userId: string, dateStr: string): Attendance | undefined => {
    return attendanceLogs.find(log => {
      const isCorrectUser = log.user?._id === userId || (log.user as any) === userId;
      const logDateStr = new Date(log.date).toISOString().slice(0, 10);
      return isCorrectUser && logDateStr === dateStr;
    });
  };

  // Check-In and Check-Out helper for Today (for Staff View)
  const getTodayLog = (): Attendance | undefined => {
    const today = new Date();
    return attendanceLogs.find(log => {
      const logDate = new Date(log.date);
      return (
        logDate.getUTCDate() === today.getDate() &&
        logDate.getUTCMonth() === today.getMonth() &&
        logDate.getUTCFullYear() === today.getFullYear() &&
        (log.user?._id === activeStaff?._id || (log.user as any) === activeStaff?._id)
      );
    });
  };

  const todayLog = getTodayLog();

  const handleQuickCheckIn = async () => {
    if (!activeStaff) return;
    try {
      const todayStr = new Date().toISOString().slice(0, 10);
      const checkInTime = new Date().toISOString();
      await logAttendance({
        user: activeStaff._id,
        date: todayStr,
        status: "present",
        checkIn: checkInTime,
        notes: "Daily check-in via Work Station dashboard."
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleQuickCheckOut = async () => {
    if (!todayLog) return;
    try {
      const checkOutTime = new Date().toISOString();
      await updateAttendance(todayLog._id, {
        status: todayLog.status,
        checkIn: todayLog.checkIn,
        checkOut: checkOutTime,
        notes: todayLog.notes
      });
    } catch (err: any) {
      console.error(err);
    }
  };

  // Open Log/Edit Modal
  const openModal = (date: Date, existingLog?: Attendance, userId?: string) => {
    setErrorMsg("");
    setModalDate(date);
    setEditingLog(existingLog || null);
    
    if (userId) {
      setModalUserId(userId);
    } else if (activeStaff) {
      setModalUserId(activeStaff._id);
    }

    if (existingLog) {
      setModalStatus(existingLog.status);
      setModalNotes(existingLog.notes || "");
      
      if (existingLog.checkIn) {
        const d = new Date(existingLog.checkIn);
        setModalCheckIn(d.toTimeString().slice(0, 5));
      } else {
        setModalCheckIn("");
      }

      if (existingLog.checkOut) {
        const d = new Date(existingLog.checkOut);
        setModalCheckOut(d.toTimeString().slice(0, 5));
      } else {
        setModalCheckOut("");
      }
    } else {
      setModalStatus("present");
      setModalNotes("");
      setModalCheckIn("");
      setModalCheckOut("");
    }
    setShowEditModal(true);
  };

  // Save Modal Log
  const handleSaveModalLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Build check-in/out full timestamps based on selected date
      let checkInTimestamp: string | null = null;
      let checkOutTimestamp: string | null = null;

      const dateBase = new Date(modalDate);

      if (modalCheckIn) {
        const [hours, minutes] = modalCheckIn.split(":");
        const d = new Date(dateBase);
        d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        checkInTimestamp = d.toISOString();
      }

      if (modalCheckOut) {
        const [hours, minutes] = modalCheckOut.split(":");
        const d = new Date(dateBase);
        d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        checkOutTimestamp = d.toISOString();
      }

      const dateStr = dateBase.toISOString().slice(0, 10);

      if (editingLog) {
        // Edit log
        await updateAttendance(editingLog._id, {
          status: modalStatus,
          checkIn: checkInTimestamp,
          checkOut: checkOutTimestamp,
          notes: modalNotes
        });
      } else {
        // Create log
        await logAttendance({
          user: modalUserId,
          date: dateStr,
          status: modalStatus,
          checkIn: checkInTimestamp,
          checkOut: checkOutTimestamp,
          notes: modalNotes
        });
      }
      setShowEditModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save attendance log.");
    }
  };

  // Delete Log
  const handleDeleteLog = async () => {
    if (!editingLog) return;
    if (!window.confirm("Are you sure you want to delete this attendance log?")) return;
    try {
      await deleteAttendance(editingLog._id);
      setShowEditModal(false);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete attendance log.");
    }
  };

  // Bulk Attendance Logging Handler
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkSuccessMsg("");
    setErrorMsg("");

    const staffList = users.filter(u => u.role === "staff" && u.email !== "staff@ktmdecor.com");
    try {
      for (const staff of staffList) {
        const status = bulkStatusMap[staff._id] || "present";
        const notes = bulkNotesMap[staff._id] || "";
        const dateBase = new Date(bulkDate);
        
        let checkInTimestamp: string | undefined = undefined;
        let checkOutTimestamp: string | undefined = undefined;

        if (status === "present" || status === "half_day") {
          // Add default check-in/out timestamps (9:00 AM to 5:00 PM)
          const checkInDate = new Date(dateBase);
          checkInDate.setHours(9, 0, 0, 0);
          checkInTimestamp = checkInDate.toISOString();

          const checkOutDate = new Date(dateBase);
          checkOutDate.setHours(17, 0, 0, 0);
          checkOutTimestamp = checkOutDate.toISOString();
        }

        await logAttendance({
          user: staff._id,
          date: bulkDate,
          status,
          checkIn: checkInTimestamp,
          checkOut: checkOutTimestamp,
          notes: notes
        });
      }

      setBulkSuccessMsg("Bulk attendance logged successfully for all staff members!");
      // Reset notes
      const initialNotes: Record<string, string> = {};
      staffList.forEach(s => {
        initialNotes[s._id] = "";
      });
      setBulkNotesMap(initialNotes);
    } catch (err: any) {
      setErrorMsg(err.message || "Bulk logging encountered some failures.");
    }
  };

  // Calculate monthly stats for a user
  const getUserMonthlyStats = (userId: string) => {
    const userLogs = attendanceLogs.filter(log => {
      const isCorrectUser = log.user?._id === userId || (log.user as any) === userId;
      return isCorrectUser;
    });

    let present = 0;
    let leaves = 0;
    let absents = 0;
    let halfDays = 0;

    userLogs.forEach(log => {
      if (log.status === "present") present++;
      else if (log.status === "leave") leaves++;
      else if (log.status === "absent") absents++;
      else if (log.status === "half_day") halfDays++;
    });

    const totalWorkingDays = getWorkingDaysInMonth(selectedYear, selectedMonth);
    const presentCredit = present + (halfDays * 0.5);
    const offDays = absents + leaves + (halfDays * 0.5);

    const workingDaysPercent = totalWorkingDays > 0 ? (presentCredit / totalWorkingDays) * 100 : 0;

    return {
      presentCount: present,
      leaveCount: leaves,
      absentCount: absents,
      halfDayCount: halfDays,
      totalWorkingDays,
      presentCredit,
      offDays,
      workingDaysPercent
    };
  };

  // Render Calendar Grid helper
  const renderCalendar = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const firstDayOfWeek = new Date(selectedYear, selectedMonth - 1, 1).getDay(); // 0 = Sunday

    const gridCells = [];

    // Preceding empty slots
    for (let i = 0; i < firstDayOfWeek; i++) {
      gridCells.push(<div key={`empty-${i}`} className="h-14 sm:h-24 md:h-28 border border-border/30 bg-muted/5 opacity-40" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const isWeekend = date.getDay() === 6; // Saturday
      const log = getLogForDay(day);
      const isToday =
        day === new Date().getDate() &&
        selectedMonth === new Date().getMonth() + 1 &&
        selectedYear === new Date().getFullYear();
      
      const isSelected = day === selectedDayNum;

      let cellBg = "bg-card";
      let textBadgeColor = "text-muted";
      let statusText = "";

      if (log) {
        if (log.status === "present") {
          cellBg = "bg-green-500/5 dark:bg-green-500/10 border-green-500/25";
          textBadgeColor = "text-green-600 dark:text-green-400";
          statusText = "Present";
        } else if (log.status === "absent") {
          cellBg = "bg-red-500/5 dark:bg-red-500/10 border-red-500/25";
          textBadgeColor = "text-red-600 dark:text-red-400";
          statusText = "Absent";
        } else if (log.status === "half_day") {
          cellBg = "bg-orange-500/5 dark:bg-orange-500/10 border-orange-500/25";
          textBadgeColor = "text-orange-600 dark:text-orange-400";
          statusText = "Half Day";
        } else if (log.status === "leave") {
          cellBg = "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/25";
          textBadgeColor = "text-amber-600 dark:text-amber-400";
          statusText = "On Leave";
        }
      } else if (isWeekend) {
        cellBg = "bg-muted/10 opacity-70";
        statusText = "Weekend";
      }

      let borderRingClass = "border-border";
      if (isSelected) {
        borderRingClass = "ring-2 ring-accent bg-accent/5 dark:bg-accent/10 border-accent/30 z-10";
      } else if (isToday) {
        borderRingClass = "ring-2 ring-accent/30 border-accent/30";
      }

      gridCells.push(
        <div
          key={`day-${day}`}
          onClick={() => {
            setSelectedDayNum(day);
          }}
          className={`h-14 sm:h-24 md:h-28 p-1.5 sm:p-2 border flex flex-col justify-between cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-sm group relative ${cellBg} ${borderRingClass}`}
        >
          <div className="flex justify-between items-start">
            <span className={`text-[10px] sm:text-xs font-extrabold ${isToday ? "text-accent" : "text-foreground"}`}>
              {day}
            </span>
            {statusText && (
              <>
                <span className={`hidden sm:inline-block text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${textBadgeColor}`}>
                  {statusText}
                </span>
                {log && (
                  <span className={`sm:hidden w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5 ${
                    log.status === "present" ? "bg-green-500" :
                    log.status === "absent" ? "bg-red-500" :
                    log.status === "half_day" ? "bg-orange-500" :
                    "bg-amber-500"
                  }`} />
                )}
              </>
            )}
          </div>

          <div className="hidden sm:flex flex-col justify-end space-y-0.5 text-[8px] sm:text-[10px] text-muted overflow-hidden">
            {log?.checkIn && (
              <div className="flex items-center gap-1">
                <Clock size={8} />
                <span className="truncate">In: {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            {log?.checkOut && (
              <div className="flex items-center gap-1">
                <Clock size={8} />
                <span className="truncate">Out: {new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            )}
            {log?.notes && (
              <div className="flex items-center gap-1 text-muted/80 max-w-full">
                <FileText size={8} className="shrink-0" />
                <span className="truncate">{log.notes}</span>
              </div>
            )}
            {!log && !isWeekend && (
              <span className="text-[8px] font-medium text-muted/50 italic select-none">
                Unmarked
              </span>
            )}
          </div>

          {/* Quick hover indicator for desktop */}
          {(isAdmin || (isToday && !log)) && (
            <div className="absolute inset-0 bg-accent/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 hidden sm:flex items-center justify-center transition-opacity rounded-xl">
              <span className="bg-accent text-white text-[9px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                Select Day
              </span>
            </div>
          )}
        </div>
      );
    }

    return gridCells;
  };

  // Render Selected Day Details Helper
  const renderSelectedDayDetails = (userIdToRender: string) => {
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDayNum);
    const isWeekend = selectedDate.getDay() === 6; // Saturday
    const log = getLogForDay(selectedDayNum);
    const isToday =
      selectedDayNum === new Date().getDate() &&
      selectedMonth === new Date().getMonth() + 1 &&
      selectedYear === new Date().getFullYear();

    let statusText = "Unmarked";
    let statusColorClass = "text-muted bg-muted/10 border-muted/20";

    if (log) {
      if (log.status === "present") {
        statusText = "Present";
        statusColorClass = "text-green-500 bg-green-500/10 border-green-500/20";
      } else if (log.status === "absent") {
        statusText = "Absent";
        statusColorClass = "text-red-500 bg-red-500/10 border-red-500/20";
      } else if (log.status === "half_day") {
        statusText = "Half Day";
        statusColorClass = "text-orange-500 bg-orange-500/10 border-orange-500/20";
      } else if (log.status === "leave") {
        statusText = "On Leave";
        statusColorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20";
      }
    } else if (isWeekend) {
      statusText = "Weekend";
      statusColorClass = "text-muted bg-muted/10 border-muted/20";
    }

    return (
      <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-muted">
              Selected Day Details
            </h4>
            <p className="text-sm font-bold text-foreground mt-0.5">
              {selectedDate.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusColorClass}`}>
              {statusText}
            </span>
            {(isAdmin || isToday || log) && (
              <button
                onClick={() => openModal(selectedDate, log, userIdToRender)}
                className="px-3 py-1.5 bg-accent hover:bg-accent-dark text-white rounded-xl text-[10px] font-bold uppercase transition-all shadow-sm"
              >
                {isAdmin ? (log ? "Edit Log" : "Log Day") : (isToday ? (log ? "Update Details" : "Log Check-In") : "View Details")}
              </button>
            )}
          </div>
        </div>

        {log && (log.checkIn || log.checkOut || log.notes) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/10 p-3 rounded-xl border border-border/40 text-xs font-semibold">
            {(log.status === "present" || log.status === "half_day") && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted">
                  <Clock size={12} />
                  <span>Timings</span>
                </div>
                <div className="space-y-1 text-foreground font-bold">
                  <p>Check-In: {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</p>
                  <p>Check-Out: {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</p>
                </div>
              </div>
            )}
            {log.notes && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-muted">
                  <FileText size={12} />
                  <span>Notes / Remarks</span>
                </div>
                <p className="text-foreground italic font-medium leading-relaxed">
                  "{log.notes}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const staffList = users.filter(u => u.role === "staff" && u.email !== "staff@ktmdecor.com");
  const selectedStaffUser = users.find(u => u._id === selectedAdminStaffId);

  // Month navigation for controls
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. BRAND HEADER */}
      <div className="bg-card border border-border/80 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-display text-foreground tracking-tight flex items-center gap-2">
            <UserIcon className="text-accent animate-pulse" size={26} />
            {isAdmin ? "Staff Management" : "Attendance"}
          </h1>
          <p className="text-xs text-muted font-bold uppercase tracking-wider mt-1">
            {isAdmin ? "Company Payroll, Attendance Logs, & Staff Profiles" : `Attendance Log Dashboard • ${activeStaff?.name || "Staff"}`}
          </p>
        </div>

        {/* Global Month/Year selector */}
        <div className="flex items-center gap-1.5 bg-muted/20 border border-border/80 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg hover:bg-card text-muted hover:text-foreground transition-all"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex gap-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-2 py-1 bg-transparent text-xs font-bold text-foreground border-none cursor-pointer focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value} className="bg-card">
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-2 py-1 bg-transparent text-xs font-bold text-foreground border-none cursor-pointer focus:outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y} className="bg-card">
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg hover:bg-card text-muted hover:text-foreground transition-all"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ─── STAFF PORTAL VIEW ─── */}
      {!isAdmin && activeStaff && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Check-In / Check-Out Widget */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-border bg-card/85 backdrop-blur shadow-sm space-y-6 text-center">
              <h2 className="text-base font-bold font-display uppercase tracking-widest text-muted border-b border-border/50 pb-3">
                Today's Work Log
              </h2>
              
              <div className="py-4 space-y-3 flex flex-col items-center">
                <div className="p-4 bg-muted/15 rounded-full border border-border/60">
                  <Clock size={40} className="text-accent animate-pulse" />
                </div>
                
                {todayLog ? (
                  <div className="space-y-1">
                    <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-green-500/10 border border-green-500/25 text-green-500">
                      Logged Present
                    </span>
                    <p className="text-[10px] text-muted font-semibold tracking-wide uppercase mt-2">
                      Check-In: {new Date(todayLog.checkIn || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {todayLog.checkOut ? (
                      <p className="text-[10px] text-muted font-semibold tracking-wide uppercase">
                        Check-Out: {new Date(todayLog.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    ) : (
                      <p className="text-[10px] text-accent font-extrabold tracking-wide uppercase">
                        On Duty (Not Checked Out)
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="text-xs font-bold text-muted uppercase tracking-widest">
                      No Records Logged Today
                    </span>
                    <p className="text-[11px] text-muted/70 mt-1 max-w-[200px] mx-auto leading-relaxed">
                      Please check-in to log your attendance for today.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {!todayLog && (
                  <button
                    onClick={handleQuickCheckIn}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-green-500/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    <span>Check In for Today</span>
                  </button>
                )}

                {todayLog && !todayLog.checkOut && (
                  <button
                    onClick={handleQuickCheckOut}
                    className="w-full py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold text-sm shadow-md hover:shadow-accent/15 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Clock size={18} />
                    <span>Check Out (End Shift)</span>
                  </button>
                )}

                {todayLog && todayLog.checkOut && (
                  <div className="py-2.5 bg-green-500/5 border border-green-500/15 rounded-xl text-green-500 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} />
                    Shift Completed Successfully
                  </div>
                )}
              </div>
            </div>

            {/* User Payout Tracker Widget */}
            <div className="glass-panel p-6 rounded-2xl border border-border bg-card/85 space-y-4">
              <h2 className="text-base font-bold font-display uppercase tracking-widest text-muted border-b border-border/50 pb-3 text-center">
                Salary Overview
              </h2>
              {(() => {
                const stats = getUserMonthlyStats(activeStaff._id);
                const baseSalary = activeStaff.baseSalary || 30000;
                const dailyRate = baseSalary / stats.totalWorkingDays;
                const calculatedSalary = baseSalary - (stats.offDays * dailyRate);

                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                      <span>Base Monthly Salary:</span>
                      <span className="text-foreground">Rs. {baseSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                      <span>Working Days:</span>
                      <span className="text-foreground">{stats.totalWorkingDays} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted border-b border-border/50 pb-2.5">
                      <span>Days Worked:</span>
                      <span className="text-green-500">{stats.presentCredit} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                      <span>Days Off / Absents:</span>
                      <span className="text-red-500">{stats.offDays} Days</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted">
                      <span>Attendance Pct %:</span>
                      <span className="text-accent">{stats.workingDaysPercent.toFixed(1)}%</span>
                    </div>
                    <div className="bg-muted/15 p-4 rounded-xl border border-border/60 flex justify-between items-center mt-4">
                      <div className="text-left">
                        <p className="text-[10px] text-muted font-extrabold uppercase tracking-widest">
                          Payout Est.
                        </p>
                        <p className="text-lg font-black text-foreground mt-0.5">
                          Rs. {Math.max(0, Math.round(calculatedSalary)).toLocaleString()}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold text-muted bg-card px-2.5 py-1.5 rounded-lg border border-border shadow-sm uppercase tracking-wider">
                        -{stats.offDays} Days Off
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Monthly Calendar View */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <h3 className="font-bold text-base font-display">
                Attendance Calendar - {months.find(m => m.value === selectedMonth)?.name} {selectedYear}
              </h3>
              <div className="flex gap-2.5 sm:gap-4 text-[9px] sm:text-[10px] font-bold uppercase text-muted">
                <span className="flex items-center gap-1"><span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500" /> Pres</span>
                <span className="flex items-center gap-1"><span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-orange-500" /> Half</span>
                <span className="flex items-center gap-1"><span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-amber-500" /> Leave</span>
                <span className="flex items-center gap-1"><span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500" /> Abs</span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-xs text-muted uppercase tracking-widest border-b border-border/60 pb-2">
              <div><span className="hidden sm:inline">Sun</span><span className="sm:hidden">S</span></div>
              <div><span className="hidden sm:inline">Mon</span><span className="sm:hidden">M</span></div>
              <div><span className="hidden sm:inline">Tue</span><span className="sm:hidden">T</span></div>
              <div><span className="hidden sm:inline">Wed</span><span className="sm:hidden">W</span></div>
              <div><span className="hidden sm:inline">Thu</span><span className="sm:hidden">T</span></div>
              <div><span className="hidden sm:inline">Fri</span><span className="sm:hidden">F</span></div>
              <div className="text-red-500"><span className="hidden sm:inline">Sat</span><span className="sm:hidden">S</span></div>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {renderCalendar()}
            </div>

            {/* Selected Day Details Card */}
            {renderSelectedDayDetails(activeStaff._id)}
          </div>
        </div>
      )}

      {/* ─── ADMIN MANAGEMENT VIEW ─── */}
      {isAdmin && (
        <div className="space-y-6">
          {/* Admin Navigation Tabs */}
          <div className="flex border-b border-border gap-2">
            <button
              onClick={() => setAdminTab("payroll")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                adminTab === "payroll"
                  ? "border-accent text-accent font-black"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <DollarSign size={16} />
              Payroll & Staff Roster
            </button>
            <button
              onClick={() => setAdminTab("calendar")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                adminTab === "calendar"
                  ? "border-accent text-accent font-black"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <Calendar size={16} />
              Detailed Staff Calendars
            </button>
            <button
              onClick={() => setAdminTab("bulk")}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                adminTab === "bulk"
                  ? "border-accent text-accent font-black"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <PlusCircle size={16} />
              Bulk Log Attendance
            </button>
          </div>

          {/* TAB 1: PAYROLL & STAFF ROSTER */}
          {adminTab === "payroll" && (
            <div className="space-y-6">
              {/* Monthly Overview Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-5 rounded-2xl border border-border flex justify-between items-center bg-card/85">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted font-extrabold uppercase tracking-widest">
                      Total Staff Count
                    </p>
                    <p className="text-2xl font-black text-foreground tracking-tight">
                      {staffList.length} Active Staff
                    </p>
                  </div>
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <UserIcon className="text-accent" size={24} />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-border flex justify-between items-center bg-card/85">
                  {(() => {
                    const totalBase = staffList.reduce((acc, s) => acc + (s.baseSalary || 30000), 0);
                    return (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted font-extrabold uppercase tracking-widest">
                          Base Monthly Payroll
                        </p>
                        <p className="text-2xl font-black text-foreground tracking-tight">
                          Rs. {totalBase.toLocaleString()}
                        </p>
                      </div>
                    );
                  })()}
                  <div className="p-3 bg-green-500/10 rounded-xl">
                    <DollarSign className="text-green-500" size={24} />
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-border flex justify-between items-center bg-card/85">
                  {(() => {
                    let totalPayout = 0;
                    staffList.forEach(s => {
                      const stats = getUserMonthlyStats(s._id);
                      const baseSalary = s.baseSalary || 30000;
                      const dailyRate = baseSalary / stats.totalWorkingDays;
                      totalPayout += baseSalary - (stats.offDays * dailyRate);
                    });

                    return (
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted font-extrabold uppercase tracking-widest">
                          Calculated Payout ({months.find(m => m.value === selectedMonth)?.name})
                        </p>
                        <p className="text-2xl font-black text-accent tracking-tight">
                          Rs. {Math.max(0, Math.round(totalPayout)).toLocaleString()}
                        </p>
                      </div>
                    );
                  })()}
                  <div className="p-3 bg-amber-500/10 rounded-xl">
                    <TrendingUp className="text-amber-500" size={24} />
                  </div>
                </div>
              </div>

              {/* Roster & Salary Payout Table */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/60 pb-4 mb-4">
                  <h3 className="font-bold text-base font-display">
                    Staff Attendance & Salary Calculations
                  </h3>
                  <button
                    onClick={() => {
                      // Simple simulated export
                      const headers = "Staff Name,Email,Base Salary,Present Days,Absent Days,Working Days %,Calculated Payout\n";
                      const rows = staffList.map(s => {
                        const stats = getUserMonthlyStats(s._id);
                        const baseSalary = s.baseSalary || 30000;
                        const dailyRate = baseSalary / stats.totalWorkingDays;
                        const finalSalary = Math.round(baseSalary - (stats.offDays * dailyRate));
                        return `"${s.name}","${s.email}",${baseSalary},${stats.presentCredit},${stats.offDays},${stats.workingDaysPercent.toFixed(1)}%,${finalSalary}`;
                      }).join("\n");

                      const blob = new Blob([headers + rows], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Payroll_Report_${selectedMonth}_${selectedYear}.csv`;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                    }}
                    className="px-3.5 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accent/15 flex items-center gap-2"
                  >
                    <FileText size={14} />
                    Export CSV Statement
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/80 text-[10px] font-extrabold uppercase tracking-widest text-muted">
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-4">Base Salary</th>
                        <th className="py-3 px-4 text-center">Working Days</th>
                        <th className="py-3 px-4 text-center">Days Worked</th>
                        <th className="py-3 px-4 text-center">Days Off</th>
                        <th className="py-3 px-4 text-center">Attendance %</th>
                        <th className="py-3 px-4 text-right">Calculated Salary</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-xs font-semibold">
                      {staffList.map((s) => {
                        const stats = getUserMonthlyStats(s._id);
                        const baseSalary = s.baseSalary || 30000;
                        const dailyRate = baseSalary / stats.totalWorkingDays;
                        const calculatedSalary = Math.max(0, Math.round(baseSalary - (stats.offDays * dailyRate)));

                        return (
                          <tr key={s._id} className="hover:bg-border/20 transition-colors">
                            <td className="py-3.5 px-4">
                              <p className="font-bold text-sm text-foreground">{s.name}</p>
                              <p className="text-[10px] text-muted">{s.email}</p>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-foreground">
                              Rs. {baseSalary.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-center text-muted">
                              {stats.totalWorkingDays}
                            </td>
                            <td className="py-3.5 px-4 text-center text-green-500 font-bold">
                              {stats.presentCredit}
                            </td>
                            <td className="py-3.5 px-4 text-center text-red-500 font-bold">
                              {stats.offDays}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold">
                              <span className={`px-2 py-0.5 rounded text-[10px] ${
                                stats.workingDaysPercent >= 90
                                  ? "bg-green-500/10 text-green-500"
                                  : stats.workingDaysPercent >= 75
                                  ? "bg-orange-500/10 text-orange-500"
                                  : "bg-red-500/10 text-red-500"
                              }`}>
                                {stats.workingDaysPercent.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right text-sm font-black text-foreground">
                              Rs. {calculatedSalary.toLocaleString()}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedAdminStaffId(s._id);
                                  setAdminTab("calendar");
                                }}
                                className="px-3 py-1.5 bg-muted/20 hover:bg-accent/15 hover:text-accent rounded-lg text-[10px] font-bold uppercase transition-all"
                              >
                                View Calendar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Daily Check-In Activity & Times Feed */}
              <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden p-4 sm:p-6 mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/60 pb-4 mb-4">
                  <div>
                    <h3 className="font-bold text-base font-display">Daily Activity & Check-In Feed</h3>
                    <p className="text-[11px] text-muted font-semibold uppercase mt-0.5 tracking-wider">
                      Verify check-in and check-out timestamps submitted by staff members
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Select Date:</label>
                    <input
                      type="date"
                      value={activityDate}
                      onChange={(e) => setActivityDate(e.target.value)}
                      className="px-3 py-1.5 border border-border rounded-xl bg-background/50 focus:outline-none focus:ring-1 focus:ring-accent text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staffList.map((s) => {
                    const log = getLogForUserOnDate(s._id, activityDate);
                    
                    let statusBadge = "Unmarked";
                    let badgeColor = "text-muted bg-muted/10 border-muted/20";
                    
                    if (log) {
                      if (log.status === "present") {
                        statusBadge = "Present";
                        badgeColor = "text-green-500 bg-green-500/10 border-green-500/20";
                      } else if (log.status === "absent") {
                        statusBadge = "Absent";
                        badgeColor = "text-red-500 bg-red-500/10 border-red-500/20";
                      } else if (log.status === "half_day") {
                        statusBadge = "Half Day";
                        badgeColor = "text-orange-500 bg-orange-500/10 border-orange-500/20";
                      } else if (log.status === "leave") {
                        statusBadge = "On Leave";
                        badgeColor = "text-amber-500 bg-amber-500/10 border-amber-500/20";
                      }
                    }

                    return (
                      <div key={`activity-${s._id}`} className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all hover:shadow-sm ${log ? "bg-muted/5 border-border" : "bg-muted/10 border-border/40 opacity-70"}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-foreground">{s.name}</h4>
                            <p className="text-[10px] text-muted">{s.email}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${badgeColor}`}>
                            {statusBadge}
                          </span>
                        </div>

                        {log ? (
                          <div className="space-y-1.5 text-xs text-muted border-t border-border/50 pt-2 font-semibold">
                            {log.checkIn && (
                              <div className="flex justify-between">
                                <span>Checked In:</span>
                                <span className="font-bold text-foreground">
                                  {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                            {log.checkOut ? (
                              <div className="flex justify-between">
                                <span>Checked Out:</span>
                                <span className="font-bold text-foreground">
                                  {new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ) : (log.status === "present" || log.status === "half_day") ? (
                              <div className="flex justify-between">
                                <span>Status:</span>
                                <span className="font-bold text-accent animate-pulse">On Duty</span>
                              </div>
                            ) : null}
                            <div className="flex justify-between border-t border-border/30 pt-1.5 text-[10px] text-muted/80">
                              <span>Entry Logged:</span>
                              <span>
                                {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-[10px] text-muted/95 italic bg-card p-1.5 rounded border border-border mt-1 shrink-0 truncate">
                                "{log.notes}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-3 text-[11px] text-muted font-medium italic border-t border-border/30 pt-3">
                            No attendance logs recorded for this day.
                          </div>
                        )}

                        {/* Quick edit button for admin */}
                        {log && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                const logDateObj = new Date(log.date);
                                openModal(logDateObj, log, s._id);
                              }}
                              className="text-[10px] font-extrabold uppercase text-accent hover:text-accent-dark transition-colors"
                            >
                              Edit Entry
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETAILED CALENDAR SELECTOR */}
          {adminTab === "calendar" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Staff Selector Left Side */}
              <div className="lg:col-span-1 space-y-4">
                <div className="glass-panel p-5 rounded-2xl border border-border bg-card/85 space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted border-b border-border/50 pb-2">
                    Select Staff Member
                  </h3>
                  <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                    {staffList.map((s) => (
                      <button
                        key={s._id}
                        onClick={() => setSelectedAdminStaffId(s._id)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl border text-xs font-bold transition-all flex justify-between items-center ${
                          selectedAdminStaffId === s._id
                            ? "bg-accent/10 border-accent/25 text-accent"
                            : "border-transparent hover:bg-border/30 text-muted hover:text-foreground"
                        }`}
                      >
                        <div>
                          <p className="font-bold leading-none">{s.name}</p>
                          <p className="text-[9px] font-medium opacity-70 mt-1">{s.email}</p>
                        </div>
                        <ChevronRight size={14} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly summary for selected user */}
                {selectedStaffUser && (
                  <div className="glass-panel p-5 rounded-2xl border border-border bg-card/85 space-y-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-muted border-b border-border/50 pb-2">
                      {selectedStaffUser.name}'s Summary
                    </h3>
                    {(() => {
                      const stats = getUserMonthlyStats(selectedAdminStaffId);
                      const baseSalary = selectedStaffUser.baseSalary || 30000;
                      const dailyRate = baseSalary / stats.totalWorkingDays;
                      const calculatedSalary = baseSalary - (stats.offDays * dailyRate);

                      return (
                        <div className="space-y-3.5 text-xs">
                          <div className="flex justify-between items-center text-muted">
                            <span>Base Salary:</span>
                            <span className="font-bold text-foreground">Rs. {baseSalary.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-muted">
                            <span>Present Credit:</span>
                            <span className="font-bold text-green-500">{stats.presentCredit} Days</span>
                          </div>
                          <div className="flex justify-between items-center text-muted">
                            <span>Absents/Leaves:</span>
                            <span className="font-bold text-red-500">{stats.offDays} Days</span>
                          </div>
                          <div className="flex justify-between items-center text-muted">
                            <span>Attendance %:</span>
                            <span className="font-bold text-accent">{stats.workingDaysPercent.toFixed(1)}%</span>
                          </div>
                          <div className="bg-muted/10 p-3.5 rounded-xl border border-border/60 flex justify-between items-center mt-3">
                            <div className="text-left">
                              <p className="text-[9px] font-extrabold text-muted uppercase tracking-widest">
                                Monthly Wage
                              </p>
                              <p className="text-base font-black text-foreground">
                                Rs. {Math.max(0, Math.round(calculatedSalary)).toLocaleString()}
                              </p>
                            </div>
                            <span className="text-[9px] font-extrabold text-red-500 bg-card border border-border px-2 py-1 rounded uppercase tracking-wider shrink-0">
                              -{stats.offDays} Days
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Monthly Calendar View Right Side */}
              <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-border/60 pb-3">
                  <h3 className="font-bold text-base font-display">
                    Calendar Log - {selectedStaffUser?.name || "Staff"}
                  </h3>
                  <div className="flex gap-2.5 sm:gap-3 text-[9px] font-extrabold uppercase text-muted">
                    <span className="flex items-center gap-1"><span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-green-500" /> Pres</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-orange-500" /> Half</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-amber-500" /> Leave</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-red-500" /> Abs</span>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] sm:text-xs text-muted uppercase tracking-widest border-b border-border/60 pb-2">
                  <div><span className="hidden sm:inline">Sun</span><span className="sm:hidden">S</span></div>
                  <div><span className="hidden sm:inline">Mon</span><span className="sm:hidden">M</span></div>
                  <div><span className="hidden sm:inline">Tue</span><span className="sm:hidden">T</span></div>
                  <div><span className="hidden sm:inline">Wed</span><span className="sm:hidden">W</span></div>
                  <div><span className="hidden sm:inline">Thu</span><span className="sm:hidden">T</span></div>
                  <div><span className="hidden sm:inline">Fri</span><span className="sm:hidden">F</span></div>
                  <div className="text-red-500"><span className="hidden sm:inline">Sat</span><span className="sm:hidden">S</span></div>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {selectedAdminStaffId && renderCalendar()}
                </div>

                {/* Selected Day Details Card */}
                {selectedAdminStaffId && renderSelectedDayDetails(selectedAdminStaffId)}
              </div>
            </div>
          )}

          {/* TAB 3: BULK ATTENDANCE LOGGER */}
          {adminTab === "bulk" && (
            <div className="bg-card border border-border rounded-2xl shadow-sm p-5 sm:p-8 max-w-4xl mx-auto space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="font-bold text-lg font-display">Bulk Daily Attendance Logger</h3>
                <p className="text-xs text-muted font-semibold mt-1 uppercase tracking-wider">
                  Log attendance for all 9 staff members simultaneously for a single calendar day
                </p>
              </div>

              {bulkSuccessMsg && (
                <div className="p-4 text-xs bg-green-500/10 border border-green-500/20 text-green-500 rounded-lg font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{bulkSuccessMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg font-bold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 block shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleBulkSubmit} className="space-y-6">
                <div className="max-w-xs space-y-2">
                  <label className="block text-xs font-bold text-muted uppercase tracking-widest">
                    Log Date
                  </label>
                  <input
                    type="date"
                    value={bulkDate}
                    onChange={(e) => setBulkDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-xl bg-background/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-bold"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-3 text-[10px] font-extrabold uppercase tracking-widest text-muted border-b border-border/80 pb-2">
                    <span className="col-span-4">Staff Member</span>
                    <span className="col-span-4 text-center">Attendance Status</span>
                    <span className="col-span-4">Notes / Remarks</span>
                  </div>

                  <div className="divide-y divide-border/60 space-y-3.5">
                    {staffList.map((staff) => (
                      <div key={staff._id} className="grid grid-cols-12 gap-3 items-center pt-3">
                        <div className="col-span-4">
                          <p className="text-sm font-bold">{staff.name}</p>
                          <p className="text-[10px] text-muted">{staff.email}</p>
                        </div>
                        
                        <div className="col-span-4 flex justify-center">
                          <select
                            value={bulkStatusMap[staff._id] || "present"}
                            onChange={(e) => {
                              const newStatus = e.target.value as "present" | "absent" | "half_day" | "leave";
                              setBulkStatusMap(prev => ({ ...prev, [staff._id]: newStatus }));
                            }}
                            className="px-2 py-1.5 border border-border rounded-lg bg-background text-xs font-bold cursor-pointer w-full max-w-[150px] focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            <option value="present">Present</option>
                            <option value="half_day">Half Day</option>
                            <option value="leave">On Leave</option>
                            <option value="absent">Absent</option>
                          </select>
                        </div>

                        <div className="col-span-4">
                          <input
                            type="text"
                            placeholder="Add note (e.g. sick leave, client visit)"
                            value={bulkNotesMap[staff._id] || ""}
                            onChange={(e) => {
                              setBulkNotesMap(prev => ({ ...prev, [staff._id]: e.target.value }));
                            }}
                            className="w-full px-3 py-1.5 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-accent text-xs font-semibold"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-accent hover:bg-accent-dark text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-accent/15 uppercase tracking-wider flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Submit Bulk Logs
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ─── LOG / EDIT ATTENDANCE MODAL ─── */}
      {showEditModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-border text-muted hover:text-foreground transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b border-border pb-2.5">
              <Calendar className="text-accent" size={20} />
              <h2 className="text-base font-bold font-display">
                {editingLog ? "Modify Attendance Log" : "New Attendance Entry"}
              </h2>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 text-xs bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 block shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveModalLog} className="space-y-4">
              {/* Date (Disabled representation) */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest">
                  Log Date
                </label>
                <input
                  type="text"
                  value={modalDate.toLocaleDateString([], { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                  className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-muted/20 text-xs font-bold text-muted focus:outline-none select-none"
                  disabled
                />
              </div>

              {/* Status Selector */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest">
                  Status
                </label>
                {isAdmin || !editingLog ? (
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-background text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                    required
                  >
                    <option value="present">Present</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">On Leave</option>
                    <option value="absent">Absent</option>
                  </select>
                ) : (
                  <input
                    type="text"
                    value={modalStatus.toUpperCase()}
                    className="w-full px-3.5 py-2.5 border border-border rounded-xl bg-muted/20 text-xs font-bold text-muted focus:outline-none select-none"
                    disabled
                  />
                )}
              </div>

              {/* Time Check-In/Out (only applicable if status present or half day) */}
              {(modalStatus === "present" || modalStatus === "half_day") && (() => {
                const isTodayModal = modalDate.toDateString() === new Date().toDateString();
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-widest">
                        Check-In Time
                      </label>
                      <input
                        type="time"
                        value={modalCheckIn}
                        onChange={(e) => setModalCheckIn(e.target.value)}
                        className="w-full px-3.5 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold disabled:opacity-60"
                        disabled={!isAdmin && !!editingLog}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-widest">
                        Check-Out Time
                      </label>
                      <input
                        type="time"
                        value={modalCheckOut}
                        onChange={(e) => setModalCheckOut(e.target.value)}
                        className="w-full px-3.5 py-2 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold disabled:opacity-60"
                        disabled={!isAdmin && !!editingLog && (!isTodayModal || !!editingLog.checkOut)}
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest">
                  Log Notes / Remarks
                </label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  className="w-full h-20 p-3.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none text-xs font-semibold disabled:opacity-60"
                  placeholder="Enter any notes (e.g. checked out early, sick leave description)"
                  disabled={!isAdmin && !!editingLog && (modalDate.toDateString() !== new Date().toDateString())}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center gap-3 pt-3 border-t border-border mt-6">
                {isAdmin && editingLog ? (
                  <button
                    type="button"
                    onClick={handleDeleteLog}
                    className="px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all uppercase tracking-wider"
                  >
                    Delete Log
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-border rounded-xl text-xs font-bold hover:bg-muted/30 transition-all text-muted"
                  >
                    {!isAdmin && !!editingLog && (modalDate.toDateString() !== new Date().toDateString()) ? "Close" : "Cancel"}
                  </button>
                  {(!(!isAdmin && !!editingLog && (modalDate.toDateString() !== new Date().toDateString()))) && (
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent hover:bg-accent-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-accent/15 uppercase tracking-wider"
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
