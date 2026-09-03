import React, { useState } from "react";
import { useStore, Task } from "../store/useStore";
import {
  List,
  Kanban,
  Pin,
  Calendar,
  User as UserIcon,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  ArrowLeft,
  X
} from "./ui/solar-icons";
import { NepaliDatePicker } from "./ui/NepaliDatePicker";
import { formatNepali } from "../utils/nepaliDate";

interface TaskBoardProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  showModal,
  setShowModal,
  editingTask,
  setEditingTask
}) => {
  const {
    user,
    tasks,
    users,
    createTask,
    updateTaskStatus,
    togglePinTask,
    deleteTask,
    activeStaffProfile
  } = useStore();

  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showAllStaffTasks, setShowAllStaffTasks] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    const assignable = users.filter((u) => u.role !== "admin" && u.email !== "staff@ktmdecor.com");
    setAssigneeId(assignable[0]?._id || "");
    setDueDate(new Date(Date.now() + 86400000).toISOString().split("T")[0]);
    setPriority("medium");
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || "");
    setAssigneeId(task.assignee?._id || "");
    setDueDate(new Date(task.dueDate).toISOString().split("T")[0]);
    setPriority(task.priority);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      title,
      description,
      assignee: assigneeId,
      dueDate,
      priority,
      totalCost: 0,
      prepaidCost: 0
    };

    if (editingTask) {
      // In our store, update is handled by the server. We will mock a PUT or hit backend
      const { token } = useStore.getState();
      const currentApiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5001");
      fetch(`${currentApiUrl}/api/tasks/${editingTask._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Update failed");
          setShowModal(false);
        })
        .catch(console.error);
    } else {
      createTask(taskData);
      setShowModal(false);
    }
  };

  // Drag and drop HTML5 setup
  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("taskId", id);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (e: React.DragEvent, status: Task["status"]) => {
    const taskId = e.dataTransfer.getData("taskId");
    updateTaskStatus(taskId, status);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {

    
    // Priority filter
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;

    // Staff persona filter
    if (user?.role === "staff" && !showAllStaffTasks) {
      const activeId = activeStaffProfile?._id;
      if (t.assignee?._id !== activeId) return false;
    }

    // Search filter
    if (
      searchQuery &&
      !t.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.assignee?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  const columns: { id: Task["status"]; label: string; bg: string; text: string }[] = [
    { id: "todo", label: "To Do", bg: "bg-slate-100 dark:bg-slate-900/30", text: "text-slate-800 dark:text-slate-200" },
    { id: "in_progress", label: "In Progress", bg: "bg-amber-100/50 dark:bg-amber-950/10", text: "text-amber-800 dark:text-amber-400" },
    { id: "done", label: "Done & Verified", bg: "bg-emerald-100/50 dark:bg-emerald-950/10", text: "text-emerald-800 dark:text-emerald-400" }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">Works to Do</h1>
          <p className="text-muted text-sm mt-1">
            Track and synchronize your daily client activities in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggles */}
          <div className="flex bg-card border border-border p-1 rounded-md">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "kanban" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
              title="Kanban Board"
            >
              <Kanban size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-all ${
                viewMode === "list" ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          {/* Create Button (Admins only) */}
          {user?.role === "admin" && (
            <button
              onClick={openCreateModal}
              style={{
                background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-black rounded-xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <Plus size={16} />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-card border border-border/80 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by task title or assignee..."
          className="flex-1 px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs transition-all duration-200"
        />

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer transition-all duration-200"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        {user?.role === "staff" && (
          <select
            value={showAllStaffTasks ? "all" : "mine"}
            onChange={(e) => setShowAllStaffTasks(e.target.value === "all")}
            className="px-4 py-2.5 border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-xs font-semibold cursor-pointer transition-all duration-200"
          >
            <option value="mine">My Tasks ({activeStaffProfile?.name.split(" ")[0] || "Select Profile"})</option>
            <option value="all">All Staff Tasks</option>
          </select>
        )}
      </div>

      {/* KANBAN BOARD */}
      {viewMode === "kanban" ? (
        <div className="flex flex-row md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory pb-4">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, col.id)}
                className={`border border-border/80 rounded-2xl shadow-sm p-5 flex flex-col h-[550px] md:h-[calc(100vh-270px)] min-h-[400px] board-column w-[88vw] md:w-auto shrink-0 snap-center ${col.bg}`}
                style={{
                  contentVisibility: "auto",
                  containIntrinsicSize: "auto 300px auto 600px"
                } as React.CSSProperties}
              >
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
                  <h3 className={`font-bold font-display text-sm ${col.text}`}>
                    {col.label}
                  </h3>
                  <span className="text-xs bg-border px-2 py-0.5 rounded font-bold text-muted">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                  {colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable={user?.role === "admin" || task.assignee?._id === (user?.email === "staff@ktmdecor.com" ? activeStaffProfile?._id : user?._id)}
                      onDragStart={(e) => onDragStart(e, task._id)}
                      className={`p-4 rounded-md bg-card border transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-accent hover:shadow-md ${
                        task.pinned
                          ? "border-accent/40 shadow-sm ring-1 ring-accent/15"
                          : "border-border"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm leading-snug break-words flex-1 line-clamp-2">
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1.5">
                          {task.pinned && (
                            <Pin size={13} className="text-accent fill-accent rotate-45" />
                          )}
                          {user?.role === "admin" && (
                            <button
                              onClick={() => togglePinTask(task._id)}
                              className={`p-0.5 rounded hover:bg-border transition-colors ${
                                task.pinned ? "text-accent" : "text-muted"
                              }`}
                              title={task.pinned ? "Unpin task" : "Pin task"}
                            >
                              <Pin size={12} className="rotate-45" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-muted mt-2 line-clamp-3 leading-normal">
                        {task.description || "No description provided."}
                      </p>

                      <div className="mt-3 flex flex-col gap-2">
                        {/* Assignee & Dates */}
                        <div className="flex items-center justify-between text-[10px] text-muted">
                          <span className="flex items-center gap-1 font-semibold">
                            <UserIcon size={12} className="text-accent" />
                            {task.assignee?.name || "Deleted User"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formatNepali(task.dueDate)}
                          </span>
                        </div>

                        {/* Controls bar */}
                        <div className="border-t border-border/50 pt-2 mt-1 flex items-center justify-between">
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase border ${
                              task.priority === "high"
                                ? "border-red-500/25 text-red-600 dark:text-red-400 font-bold"
                                : task.priority === "medium"
                                ? "border-amber-500/25 text-amber-600 dark:text-amber-400"
                                : "border-green-500/25 text-green-600 dark:text-green-400"
                            }`}
                          >
                            {task.priority}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* User Quick Actions */}
                            {user?.role === "admin" ? (
                              <>
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="p-1 rounded bg-accent text-white hover:bg-accent-dark shadow-sm"
                                  title="Edit"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  onClick={() => deleteTask(task._id)}
                                  className="p-1 rounded bg-red-600 text-white hover:bg-red-700 shadow-sm"
                                  title="Delete"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </>
                            ) : (
                              // Staff manual column navigation buttons
                              (user?.email === "staff@ktmdecor.com" ? task.assignee?._id === activeStaffProfile?._id : task.assignee?._id === user?._id) && (
                                <div className="flex items-center gap-1">
                                  {col.id === "in_progress" && (
                                    <button
                                      onClick={() => updateTaskStatus(task._id, "todo")}
                                      className="p-1 hover:bg-border rounded text-muted"
                                      title="Move to Todo"
                                    >
                                      <ArrowLeft size={11} />
                                    </button>
                                  )}
                                  {col.id === "todo" && (
                                    <button
                                      onClick={() => updateTaskStatus(task._id, "in_progress")}
                                      className="p-1 hover:bg-border rounded text-accent"
                                      title="Move to In Progress"
                                    >
                                      <ArrowRight size={11} />
                                    </button>
                                  )}
                                  {col.id === "in_progress" && (
                                    <button
                                      onClick={() => updateTaskStatus(task._id, "done")}
                                      className="p-1 bg-green-600 text-white hover:bg-green-700 rounded shadow-sm"
                                      title="Move to Done"
                                    >
                                      <ArrowRight size={11} />
                                    </button>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-border/40 rounded-lg p-8 text-center text-xs text-muted h-32 flex items-center justify-center">
                      No tasks in this list
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED LIST VIEW */
        <div className="bg-card border border-border/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-card border-b border-border text-muted font-display font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4 w-12">Pin</th>
                  <th className="p-4">Task Title</th>
                  <th className="p-4">Assignee</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  {user?.role === "admin" && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted">
                      No tasks matching filters found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr
                      key={task._id}
                      className={`hover:bg-accent/5 transition-colors ${
                        task.pinned ? "bg-accent/5 dark:bg-accent/10" : ""
                      }`}
                    >
                      <td className="p-4">
                        {user?.role === "admin" ? (
                          <button
                            onClick={() => togglePinTask(task._id)}
                            className={`${task.pinned ? "text-accent" : "text-muted"} hover:text-accent`}
                          >
                            <Pin size={16} className={task.pinned ? "rotate-45 fill-accent" : "rotate-45"} />
                          </button>
                        ) : (
                          task.pinned && <Pin size={16} className="text-accent fill-accent rotate-45" />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{task.title}</div>
                        <div className="text-xs text-muted mt-0.5 line-clamp-1">
                          {task.description || "No description."}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-muted">
                        {task.assignee?.name || "Deleted User"}
                      </td>
                      <td className="p-4 text-xs text-muted font-medium">
                        {formatNepali(task.dueDate)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase border ${
                            task.priority === "high"
                              ? "border-red-500/25 text-red-600 dark:text-red-400 font-bold"
                              : task.priority === "medium"
                              ? "border-amber-500/25 text-amber-600 dark:text-amber-400"
                              : "border-green-500/25 text-green-600 dark:text-green-400"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        {user?.role === "admin" || task.assignee?._id !== (user?.email === "staff@ktmdecor.com" ? activeStaffProfile?._id : user?._id) ? (
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase border ${
                              task.status === "done"
                                ? "border-green-500/25 text-green-600 dark:text-green-400"
                                : task.status === "in_progress"
                                ? "border-amber-500/25 text-amber-600 dark:text-amber-400"
                                : "border-border text-muted"
                            }`}
                          >
                            {task.status.replace("_", " ")}
                          </span>
                        ) : (
                          <select
                            value={task.status}
                            onChange={(e) => updateTaskStatus(task._id, e.target.value as Task["status"])}
                            className="px-2 py-1 text-xs border border-border bg-card rounded"
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        )}
                      </td>
                      {user?.role === "admin" && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(task)}
                              className="p-1 text-white bg-accent hover:bg-accent-dark rounded transition-all shadow-sm"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => deleteTask(task._id)}
                              className="p-1 text-white bg-red-600 hover:bg-red-700 rounded transition-all shadow-sm"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-20 sm:p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-md rounded-lg border border-border p-4 sm:p-6 shadow-2xl animate-scale-up max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                {editingTask ? <Edit2 size={20} className="text-accent" /> : <Plus size={20} className="text-accent" />}
                {editingTask ? "Modify Assigned Work" : "Assign New Work"}
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
                  Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                  placeholder="e.g. Design Kitchen Blueprint Layout"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 p-3 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent resize-none text-sm"
                  placeholder="Detail the deliverable specifications or instructions for the staff..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Assignee Staff
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-accent text-sm"
                    required
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

                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Due Date (BS)
                  </label>
                  <NepaliDatePicker
                    value={dueDate}
                    onChange={(iso) => setDueDate(iso)}
                    required
                  />
                </div>
              </div>



              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-xs font-bold uppercase rounded border transition-all ${
                        priority === p
                          ? p === "high"
                            ? "bg-red-500 text-white border-red-500"
                            : p === "medium"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-green-500 text-white border-green-500"
                          : "border-border text-muted hover:bg-border"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
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
                  style={{
                    background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
                  }}
                  className="px-5 py-2 text-black rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  {editingTask ? "Save Task" : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
