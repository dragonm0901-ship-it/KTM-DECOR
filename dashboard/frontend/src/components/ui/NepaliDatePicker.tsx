import React, { useState, useEffect, useRef } from "react";
import {
  toNepaliDate,
  formatNepali,
  getCurrentNepaliDate,
  NEPALI_MONTHS,
  NEPALI_YEARS,
  NEPALI_DAYS,
  getDaysInBsMonth,
  getFirstDayOfBsMonth,
  bsToAd,
} from "../../utils/nepaliDate";
import { Calendar, ChevronLeft, ChevronRight, X } from "./solar-icons";

interface NepaliDatePickerProps {
  value: string | Date | null | undefined;
  onChange: (isoDate: string, bsFormatted: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  align?: "left" | "right";
}

export const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select Nepali date...",
  className = "",
  disabled = false,
  align = "left",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize selected BS state from value or today
  const currentBs = getCurrentNepaliDate();

  const parsedNd = toNepaliDate(value);
  const [viewYear, setViewYear] = useState<number>(parsedNd ? parsedNd.getYear() : currentBs.year);
  const [viewMonth, setViewMonth] = useState<number>(parsedNd ? parsedNd.getMonth() + 1 : currentBs.month); // 1-12

  // Sync view when value changes from outside
  useEffect(() => {
    if (value) {
      const nd = toNepaliDate(value);
      if (nd) {
        setViewYear(nd.getYear());
        setViewMonth(nd.getMonth() + 1);
      }
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const adDate = bsToAd(viewYear, viewMonth, day);
    // Keep local noon time to avoid UTC day boundary shift
    adDate.setHours(12, 0, 0, 0);
    const isoString = adDate.toISOString().split("T")[0];
    const bsFormatted = formatNepali(adDate);
    onChange(isoString, bsFormatted);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const isoString = today.toISOString().split("T")[0];
    const bsFormatted = formatNepali(today);
    onChange(isoString, bsFormatted);
    setViewYear(currentBs.year);
    setViewMonth(currentBs.month);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", "");
    setIsOpen(false);
  };

  // Selected date info
  const selectedBs = parsedNd
    ? {
        year: parsedNd.getYear(),
        month: parsedNd.getMonth() + 1,
        day: parsedNd.getDate(),
      }
    : null;

  // Calendar calculations for current view
  const daysInMonth = getDaysInBsMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfBsMonth(viewYear, viewMonth); // 0 = Sunday

  const displayValue = value ? formatNepali(value) : "";

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Input Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2 border rounded-xl bg-card text-foreground cursor-pointer transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-muted/20 border-border"
            : isOpen
            ? "border-accent ring-2 ring-accent/20"
            : "border-border hover:border-border/80"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Calendar size={16} className="text-accent flex-shrink-0" />
          <span className={`text-xs font-semibold truncate ${displayValue ? "text-foreground" : "text-muted"}`}>
            {displayValue || placeholder}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {displayValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-md hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Calendar Popup */}
      {isOpen && (
        <div className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} z-50 mt-1.5 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-card border border-border/80 rounded-2xl shadow-xl p-3.5 animate-in fade-in zoom-in-95 duration-150`}>
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 pb-3 border-b border-border/60">
            {/* Prev Month */}
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Month & Year Dropdowns */}
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold bg-muted/20 border border-border/70 rounded-lg px-2 py-1 text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                {NEPALI_MONTHS.map((m) => (
                  <option key={m.value} value={m.value} className="bg-card text-foreground">
                    {m.name} ({m.nepaliName})
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                onClick={(e) => e.stopPropagation()}
                className="text-xs font-bold bg-muted/20 border border-border/70 rounded-lg px-2 py-1 text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                {NEPALI_YEARS.map((y) => (
                  <option key={y} value={y} className="bg-card text-foreground">
                    {y} BS
                  </option>
                ))}
              </select>
            </div>

            {/* Next Month */}
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-muted/20 text-muted hover:text-foreground transition-colors"
              aria-label="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels (Sun to Sat) */}
          <div className="grid grid-cols-7 gap-1 text-center py-2 border-b border-border/40">
            {NEPALI_DAYS.map((d, idx) => (
              <div
                key={d.short}
                className={`text-[10px] font-extrabold uppercase ${
                  idx === 6 ? "text-amber-500" : "text-muted"
                }`}
                title={d.name}
              >
                {d.nepaliShort}
              </div>
            ))}
          </div>

          {/* Month Day Grid */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Preceding Empty Slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8 w-full" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayOfWeek = (firstDayOfWeek + i) % 7;
              const isSaturday = dayOfWeek === 6;

              const isSelected =
                selectedBs &&
                selectedBs.year === viewYear &&
                selectedBs.month === viewMonth &&
                selectedBs.day === day;

              const isToday =
                currentBs.year === viewYear &&
                currentBs.month === viewMonth &&
                currentBs.day === day;

              let btnClass = "text-foreground hover:bg-muted/30";
              if (isSelected) {
                btnClass = "bg-accent text-white font-extrabold shadow-sm";
              } else if (isToday) {
                btnClass = "border border-accent text-accent font-bold bg-accent/5";
              } else if (isSaturday) {
                btnClass = "text-amber-600 dark:text-amber-400 font-semibold hover:bg-amber-500/10";
              }

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`h-8 w-full rounded-lg text-xs font-medium flex items-center justify-center transition-all ${btnClass}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action: Today */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-border/60">
            <span className="text-[10px] text-muted font-bold">
              Today: {currentBs.monthName} {currentBs.day}, {currentBs.year}
            </span>
            <button
              type="button"
              onClick={handleSelectToday}
              className="px-2.5 py-1 text-[11px] font-bold text-accent hover:bg-accent/10 rounded-lg transition-colors"
            >
              Select Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
