import React, { useState } from "react";
import { useStore } from "../store/useStore";
import {
  Activity as ActivityIcon,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Pin,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  DollarSign
} from "./ui/solar-icons";

interface OverviewProps {
  setCurrentTab: (tab: string) => void;
  openTaskModal: () => void;
  openCampaignModal: () => void;
}

export const DashboardOverview: React.FC<OverviewProps> = ({
  setCurrentTab,
  openTaskModal,
  openCampaignModal
}) => {
  const {
    user,
    tasks,
    campaigns,
    activities,
    focusMode,
    toggleFocusMode,
    quickNotes,
    addQuickNote,
    deleteQuickNote,
    users,
    activeStaffProfile
  } = useStore();

  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);

  // Completed tasks sorted chronologically by completion date (updatedAt)
  const completedTasks = tasks
    .filter((t) => t.status === "done")
    .sort((a, b) => new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime());

  // Dynamic Sales: Sum of total cost of all completed tasks
  const totalSales = completedTasks.reduce((acc, t) => acc + (t.totalCost || 0), 0);

  // Statistics calculations
  const pendingTasks = tasks.filter((t) => t.status !== "done");
  const completedTasksCount = completedTasks.length;
  const pinnedTasks = tasks.filter((t) => t.pinned);

  // Staff specific pending tasks
  const staffPendingTasks = pendingTasks.filter(
    (t) => t.assignee?._id === (user?.email === "staff@ktmdecor.com" ? activeStaffProfile?._id : user?._id)
  );

  // Generate sales chart data points
  const getSalesChartData = () => {
    const points: { label: string; value: number }[] = [{ label: "Start", value: 0 }];
    let cumulative = 0;
    
    completedTasks.forEach((t) => {
      cumulative += t.totalCost || 0;
      const dateStr = new Date(t.updatedAt || t.createdAt).toLocaleDateString([], {
        month: "short",
        day: "numeric"
      });
      points.push({ label: dateStr, value: cumulative });
    });

    if (points.length === 1) {
      points.push({ label: "Today", value: 0 });
    }

    return points;
  };

  const chartData = getSalesChartData();

  // Render graph path config
  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 55;
  const paddingY = 20;

  const maxVal = Math.max(...chartData.map((d) => d.value), 1000);
  
  const getCoordinates = () => {
    return chartData.map((d, index) => {
      const x = paddingX + (index / (chartData.length - 1)) * (svgWidth - 2 * paddingX);
      const y = (svgHeight - paddingY) - (d.value / maxVal) * (svgHeight - 2 * paddingY);
      return { x, y, label: d.label, value: d.value };
    });
  };

  const coords = getCoordinates();

  let linePath = "";
  let areaPath = "";

  if (coords.length > 0) {
    linePath = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const p0 = coords[i - 1];
      const p = coords[i];
      const cpX1 = p0.x + (p.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p.x - p0.x) / 2;
      const cpY2 = p.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }
    areaPath = `${linePath} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`;
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (coords.length === 0) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * svgWidth;
    
    let closest = coords[0];
    let minDiff = Math.abs(mouseX - coords[0].x);
    
    for (let i = 1; i < coords.length; i++) {
      const diff = Math.abs(mouseX - coords[i].x);
      if (diff < minDiff) {
        minDiff = diff;
        closest = coords[i];
      }
    }
    
    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Sticky notes colors
  const stickyColors = [
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800/50",
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/50",
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800/50",
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200 border-purple-200 dark:border-purple-800/50"
  ];

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addQuickNote(noteText.trim());
    setNoteText("");
    setShowNoteInput(false);
  };

  // Staff Performance list (completed tasks per user)
  const getStaffPerformance = (): { name: string; completed: number; pending: number }[] => {
    const perfMap: { [key: string]: { name: string; completed: number; pending: number } } = {};
    
    // Initialize with all users
    users.forEach((u) => {
      perfMap[u._id] = { name: u.name, completed: 0, pending: 0 };
    });

    tasks.forEach((t) => {
      const assigneeId = t.assignee?._id;
      if (assigneeId && perfMap[assigneeId]) {
        if (t.status === "done") {
          perfMap[assigneeId].completed += 1;
        } else {
          perfMap[assigneeId].pending += 1;
        }
      }
    });

    return Object.values(perfMap).sort((a, b) => b.completed - a.completed);
  };

  const staffPerformance = getStaffPerformance();

  return (
    <div className="space-y-6 relative">
      {/* Personalized Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            Welcome back, <span className="text-accent">
              {(user?.email === "staff@ktmdecor.com" && activeStaffProfile)
                ? activeStaffProfile.name.split(" ")[0]
                : user?.name.split(" ")[0]}
            </span>!
          </h1>
          <p className="text-muted text-sm mt-1">
            {user?.role === "admin"
              ? "Here's what is happening across KTM DECOR today."
              : "Review your pending items and get started on today's tasks."}
          </p>
        </div>

        {/* Focus Mode & Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFocusMode}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all border ${
              focusMode
                ? "bg-accent/15 border-accent text-accent shadow-sm"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {focusMode ? <EyeOff size={14} /> : <Eye size={14} />}
            Focus Mode: {focusMode ? "ON" : "OFF"}
          </button>
        </div>
      </div>

      {/* ─── PINNED / HIGH PRIORITY SECTION ─── */}
      {pinnedTasks.length > 0 && (
        <div className="border border-red-500/20 bg-red-500/5 dark:bg-red-500/10 rounded-lg p-4 animate-pulse-dots">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-display font-bold text-sm mb-3">
            <Pin size={16} className="rotate-45" />
            PINNED & URGENT DELIVERABLES
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pinnedTasks.map((task) => (
              <div
                key={task._id}
                className="bg-card border border-border p-3.5 rounded-md flex justify-between items-start gap-4 shadow-sm"
              >
                <div>
                  <h3 className="font-semibold text-sm line-clamp-1">{task.title}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2">
                    {task.description || "No description provided."}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[10px] border border-red-500/25 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-medium">
                      {task.priority.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-muted font-medium">
                      Assignee: {task.assignee?.name || "Deleted User"}
                    </span>
                    <span className="text-[10px] text-muted font-medium flex items-center gap-1">
                      <Clock size={10} />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* METRIC CARD STATS FOR ADMIN OR STAFF */}
      {user?.role === "admin" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Total Sales</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-green-500">Rs. {totalSales.toLocaleString()}</h3>
              <p className="text-[10px] text-muted mt-1">Project valuation metrics</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-green-500 rounded-md shadow-sm">
              <DollarSign size={22} />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Marketing Notes</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-accent">{campaigns.length}</h3>
              <p className="text-[10px] text-muted mt-1">Collaborative team updates</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-accent rounded-md shadow-sm">
              <FileText size={22} />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Pending Tasks</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-amber-500">{pendingTasks.length}</h3>
              <p className="text-[10px] text-muted mt-1">Awaiting implementation</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-amber-500 rounded-md shadow-sm">
              <Clock size={22} />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Done Tasks</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-blue-500">{completedTasksCount}</h3>
              <p className="text-[10px] text-muted mt-1">Completed checklist logs</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-blue-500 rounded-md shadow-sm">
              <CheckCircle size={22} />
            </div>
          </div>
        </div>
      ) : (
        // STAFF PERSONAL METRICS CARD
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Your Pending Tasks</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-amber-500">
                {staffPendingTasks.length}
              </h3>
              <p className="text-[10px] text-muted mt-1">Tasks for immediate attention</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-amber-500 rounded-md shadow-sm">
              <Clock size={22} />
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Focus Mode Status</span>
              <h3 className="text-xl font-bold font-display mt-2">
                {focusMode ? "Active: Pinned Only" : "Standard View"}
              </h3>
              <p className="text-[10px] text-muted mt-1">Hides distractions from feed</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-accent rounded-md shadow-sm">
              {focusMode ? <EyeOff size={22} /> : <Eye size={22} />}
            </div>
          </div>

          <div className="glass-panel p-5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-xs text-muted font-semibold uppercase tracking-wider">Marketing Hub</span>
              <h3 className="text-2xl font-bold font-display mt-2 text-blue-500">
                {campaigns.length}
              </h3>
              <p className="text-[10px] text-muted mt-1">Collaborative team updates</p>
            </div>
            <div className="p-2.5 border border-border bg-card text-blue-500 rounded-md shadow-sm">
              <FileText size={22} />
            </div>
          </div>
        </div>
      )}

      {/* SECONDARY ROW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: STAFF LIST (ADMIN) / TODAY'S SCHEDULE (STAFF) */}
        <div className="glass-panel rounded-lg p-5 flex flex-col h-[400px]">
          <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center gap-2">
            {user?.role === "admin" ? (
              <>
                <TrendingUp size={18} className="text-accent" />
                Staff Performance & Workload
              </>
            ) : (
              <>
                <CheckCircle size={18} className="text-accent" />
                Your Pending Schedule
              </>
            )}
          </h2>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {user?.role === "admin" ? (
              staffPerformance.map((staff) => (
                <div
                  key={staff.name}
                  className="flex items-center justify-between p-3 rounded-md bg-card border border-border"
                >
                  <div>
                    <h4 className="font-semibold text-sm">{staff.name}</h4>
                    <span className="text-[10px] text-muted font-medium">
                      {staff.pending} tasks remaining
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="border border-green-500/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded font-semibold uppercase">
                      {staff.completed} Completed
                    </span>
                  </div>
                </div>
              ))
            ) : staffPendingTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                <CheckCircle size={40} className="text-green-500/30 mb-2" />
                <p className="text-sm">Great job! No pending tasks remaining today.</p>
              </div>
            ) : (
              staffPendingTasks.map((task) => (
                <div
                  key={task._id}
                  onClick={() => setCurrentTab("tasks")}
                  className="p-3 bg-card border border-border rounded-md hover:border-accent hover:shadow-sm cursor-pointer transition-all"
                >
                  <h4 className="font-semibold text-sm line-clamp-1">{task.title}</h4>
                  <p className="text-xs text-muted mt-1 line-clamp-1">
                    {task.description || "No description."}
                  </p>
                  <div className="flex justify-between items-center mt-3">
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase border ${
                        task.priority === "high"
                          ? "border-red-500/25 text-red-600 dark:text-red-400"
                          : task.priority === "medium"
                          ? "border-amber-500/25 text-amber-600 dark:text-amber-400"
                          : "border-green-500/25 text-green-600 dark:text-green-400"
                      }`}
                    >
                      {task.priority}
                    </span>
                    <span className="text-[10px] text-muted font-medium">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN: LIVE ACTIVITY LOG (ADMIN) / OR FOCUS MODE NOTIFICATION BAR */}
        {user?.role === "admin" ? (
          <div className="glass-panel rounded-lg p-5 flex flex-col h-[400px]">
            <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center gap-2">
              <ActivityIcon size={18} className="text-accent" />
              Activity Audit Log
            </h2>
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {activities.length === 0 ? (
                <div className="h-full flex items-center justify-center text-muted text-sm">
                  No activity logged yet
                </div>
              ) : (
                activities.map((act) => (
                  <div key={act._id} className="p-3 bg-card border border-border rounded-md text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-accent">{act.user?.name || "Deleted User"}</span>
                      <span className="text-[10px] text-muted">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                    <span className="font-semibold text-foreground uppercase tracking-wide block text-[9px] mb-1">
                      {act.action}
                    </span>
                    <p className="text-muted leading-tight">{act.details}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-lg p-5 flex flex-col h-[400px]">
            <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-accent" />
              Focus & Priorities
            </h2>
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted">
                  Focus Mode allows you to filter out background noise and list only your pinned, high-priority deliverables.
                </p>
                <div className="p-4 rounded bg-accent/5 border border-accent/15 flex items-start gap-3">
                  <Pin size={18} className="text-accent mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Pinning tasks</h4>
                    <p className="text-xs text-muted mt-1">
                      Admins pin critical announcements or client requirements. Pinned tasks lock to the top of your layout for instant visibility.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={toggleFocusMode}
                className={`w-full py-3 rounded-md font-semibold text-sm transition-all border ${
                  focusMode
                    ? "bg-accent text-white border-accent hover:bg-accent-dark"
                    : "border-accent text-accent bg-transparent hover:bg-accent/5"
                }`}
              >
                {focusMode ? "Disable Focus Mode" : "Enable Focus Mode"}
              </button>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: QUICK NOTES STICKY REMINDERS */}
        <div className="glass-panel rounded-lg p-5 flex flex-col h-[400px]">
          <h2 className="text-base font-bold font-display border-b border-border pb-3 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText size={18} className="text-accent" />
              Quick-Notes Widget
            </span>
            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="p-1 rounded-full hover:bg-border text-accent"
              aria-label="Add Note"
            >
              <Plus size={18} />
            </button>
          </h2>

          {showNoteInput && (
            <form onSubmit={handleAddNote} className="mb-4 animate-slide-up">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="Type note and hit enter..."
                  required
                />
                <button
                  type="submit"
                  className="px-3 bg-accent text-white text-xs rounded hover:bg-accent-dark transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          <div className="flex-1 overflow-y-auto pr-1">
            {quickNotes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted">
                <FileText size={40} className="text-muted/30 mb-2" />
                <p className="text-sm">No personal notes created yet. Click the + button above to add one.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {quickNotes.map((note, index) => {
                  const colorClass = stickyColors[index % stickyColors.length];
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-md border flex flex-col justify-between min-h-[90px] ${colorClass}`}
                    >
                      <p className="text-xs font-medium leading-normal break-words">
                        {note}
                      </p>
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => deleteQuickNote(index)}
                          className="p-0.5 rounded hover:bg-black/10 text-inherit opacity-70 hover:opacity-100 transition-all"
                          title="Delete note"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SALES GROWTH TREND (ADMIN ONLY - ON THE BOTTOM) */}
      {user?.role === "admin" && (
        <div className="glass-panel p-5 rounded-lg border border-border relative overflow-hidden transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
            <div>
              <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
                <TrendingUp size={16} className="text-accent" />
                Sales Growth Trend
              </h3>
              <p className="text-[10px] text-muted">Fluid reactive line tracking your project values</p>
            </div>
            
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                <span className="text-muted text-[10px]">Cumulative Sales Revenue</span>
              </div>
            </div>
          </div>

          <div className="relative w-full h-[220px]">
            {coords.length <= 1 ? (
              <div className="h-full flex items-center justify-center text-muted text-xs border border-dashed border-border/40 rounded">
                Add completed tasks with values to view graph progression
              </div>
            ) : (
              <>
                <svg
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                  className="w-full h-full overflow-visible select-none"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <defs>
                    <linearGradient id="sales-gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal gridlines */}
                  {[0.25, 0.5, 0.75, 1.0].map((ratio, index) => {
                    const yVal = svgHeight - paddingY - ratio * (svgHeight - 2 * paddingY);
                    const costLabel = Math.round(ratio * maxVal);
                    return (
                      <g key={index} className="opacity-40">
                        <line
                          x1={paddingX}
                          y1={yVal}
                          x2={svgWidth - paddingX}
                          y2={yVal}
                          stroke="var(--border)"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                        />
                        <text
                          x={paddingX - 8}
                          y={yVal + 3}
                          fill="var(--muted)"
                          fontSize="8"
                          className="font-bold text-right"
                          textAnchor="end"
                        >
                          Rs. {costLabel >= 1000 ? `${(costLabel / 1000).toFixed(0)}k` : costLabel}
                        </text>
                      </g>
                    );
                  })}

                  {/* Shaded Area */}
                  {areaPath && (
                    <path
                      d={areaPath}
                      fill="url(#sales-gradient)"
                      className="transition-all duration-300 ease-out"
                    />
                  )}

                  {/* Bezier Path Line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="transition-all duration-300 ease-out"
                    />
                  )}

                  {/* X Axis Date labels */}
                  {coords.map((c, index) => {
                    // Only show first, middle, and last to avoid clutter
                    const showLabel = index === 0 || index === coords.length - 1 || (coords.length > 2 && index === Math.floor(coords.length / 2));
                    if (!showLabel) return null;
                    return (
                      <text
                        key={index}
                        x={c.x}
                        y={svgHeight - 4}
                        fill="var(--muted)"
                        fontSize="8"
                        className="font-semibold text-center"
                        textAnchor="middle"
                      >
                        {c.label}
                      </text>
                    );
                  })}

                  {/* Hover reference line */}
                  {hoveredPoint && (
                    <line
                      x1={hoveredPoint.x}
                      y1={paddingY}
                      x2={hoveredPoint.x}
                      y2={svgHeight - paddingY}
                      stroke="var(--accent)"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                      className="opacity-75"
                    />
                  )}

                  {/* Hover dot */}
                  {hoveredPoint && (
                    <g>
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="6"
                        fill="var(--accent)"
                        className="opacity-20 animate-ping-small"
                      />
                      <circle
                        cx={hoveredPoint.x}
                        cy={hoveredPoint.y}
                        r="4"
                        fill="var(--accent)"
                        stroke="var(--card)"
                        strokeWidth="1.5"
                        className="shadow"
                      />
                    </g>
                  )}
                </svg>

                {/* Floating Tooltip Div */}
                {hoveredPoint && (
                  <div
                    className="absolute bg-card border border-border p-2 rounded shadow-2xl text-[10px] pointer-events-none transition-all duration-75 select-none z-30"
                    style={{
                      left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                      top: `${(hoveredPoint.y / svgHeight) * 100 - 45}%`,
                      transform: "translateX(-50%)"
                    }}
                  >
                    <span className="text-[8px] text-muted font-bold block uppercase tracking-wider">
                      {hoveredPoint.label}
                    </span>
                    <span className="font-extrabold text-accent block mt-0.5 whitespace-nowrap">
                      Rs. {hoveredPoint.value.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) FOR QUICK ACTIONS */}
      <div className="fixed bottom-16 md:bottom-6 right-6 z-50">
        <div className="relative">
          {/* Quick Actions Panel */}
          {fabOpen && (
            <div className="absolute bottom-16 right-0 mb-2 w-48 bg-card border border-border rounded-lg shadow-2xl overflow-hidden py-1 flex flex-col animate-slide-up">
              {user?.role === "admin" && (
                <>
                  <button
                    onClick={() => {
                      setFabOpen(false);
                      openTaskModal();
                    }}
                    className="px-4 py-2.5 text-xs text-left font-medium hover:bg-border text-foreground flex items-center gap-2"
                  >
                    <Plus size={14} className="text-accent" />
                    Assign New Task
                  </button>
                  <button
                    onClick={() => {
                      setFabOpen(false);
                      openCampaignModal();
                    }}
                    className="px-4 py-2.5 text-xs text-left font-medium hover:bg-border text-foreground flex items-center gap-2"
                  >
                    <Calendar size={14} className="text-accent" />
                    Create Marketing Entry
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setFabOpen(false);
                  setShowNoteInput(true);
                }}
                className="px-4 py-2.5 text-xs text-left font-medium hover:bg-border text-foreground flex items-center gap-2"
              >
                <FileText size={14} className="text-accent" />
                Add Sticky Note
              </button>
            </div>
          )}

          {/* Core FAB Toggle Button */}
          <button
            onClick={() => setFabOpen(!fabOpen)}
            className="h-12 w-12 rounded-full bg-accent text-white shadow-xl flex items-center justify-center hover:bg-accent-dark transition-all hover:scale-105"
            aria-label="Quick action trigger"
          >
            <Plus size={24} className={`transition-transform duration-200 ${fabOpen ? "rotate-45" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
