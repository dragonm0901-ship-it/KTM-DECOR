import React, { useState, useMemo, useRef } from "react";
import { formatNepaliShort } from "../utils/nepaliDate";

interface SalesExpensesTrendChartProps {
  sales: any[];
  expenses: any[];
  purchases?: any[];
  orders?: any[];
  completedTasks?: any[];
  title?: string;
  className?: string;
}

type Timeframe = "Week" | "Month" | "6 months" | "Year" | "All";

const safeParseDate = (d: any, fallback?: any): Date => {
  if (d instanceof Date && !isNaN(d.getTime())) return d;
  if (d) {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  if (fallback) {
    const parsedFallback = new Date(fallback);
    if (!isNaN(parsedFallback.getTime())) return parsedFallback;
  }
  return new Date();
};

export const SalesExpensesTrendChart: React.FC<SalesExpensesTrendChartProps> = ({
  sales = [],
  expenses = [],
  purchases = [],
  orders = [],
  completedTasks = [],
  title = "Sales & Expenses Growth Trend",
  className = "",
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>("All");
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    ySales: number;
    yExpenses: number;
    label: string;
    salesVal: number;
    expensesVal: number;
    purchasesVal: number;
    costsVal: number;
    netVal: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 1. Process all sales, expenses, and purchases chronologically
  const { allSalesItems, allExpensesItems, allPurchasesItems } = useMemo(() => {
    const sItems: { date: Date; value: number }[] = [];
    const eItems: { date: Date; value: number }[] = [];
    const pItems: { date: Date; value: number }[] = [];

    // Process completed tasks revenue (aligns with homescreen sales calculation)
    (completedTasks || []).forEach((t) => {
      const val = Number(t.totalCost) || 0;
      if (val > 0) {
        sItems.push({
          date: safeParseDate(t.updatedAt, t.createdAt),
          value: val,
        });
      }
    });

    // Process direct sales records
    (sales || []).forEach((s) => {
      const val = Number(s.amount) || 0;
      if (val > 0) {
        sItems.push({
          date: safeParseDate(s.date, s.createdAt),
          value: val,
        });
      }
    });

    // Process delivered/paid orders that might not be in sales yet (avoid duplicate counting)
    (orders || []).forEach((o) => {
      if (o.deleted) return;
      if (o.stage === "delivered" || o.stage === "paid" || o.approved) {
        const val = Number(o.totalPrice || o.price) || 0;
        const oIdStr = o._id?.toString();
        const isAlreadyInSales = (sales || []).some((s) => {
          const sOrderId = (typeof s.orderId === "object" && s.orderId !== null)
            ? (s.orderId as any)._id?.toString()
            : s.orderId?.toString();
          return Boolean(sOrderId && oIdStr && sOrderId === oIdStr);
        });

        if (!isAlreadyInSales && val > 0) {
          sItems.push({
            date: safeParseDate(o.approvedAt || o.updatedAt, o.createdAt),
            value: val,
          });
        }
      }
    });

    // Process operating expenses
    (expenses || []).forEach((e) => {
      const val = Number(e.amount) || 0;
      if (val > 0) {
        eItems.push({
          date: safeParseDate(e.date, e.createdAt),
          value: val,
        });
      }
    });

    // Process supplier/material purchases
    (purchases || []).forEach((p) => {
      const val = Number(p.amount) || 0;
      if (val > 0) {
        pItems.push({
          date: safeParseDate(p.date, p.createdAt),
          value: val,
        });
      }
    });

    sItems.sort((a, b) => a.date.getTime() - b.date.getTime());
    eItems.sort((a, b) => a.date.getTime() - b.date.getTime());
    pItems.sort((a, b) => a.date.getTime() - b.date.getTime());

    return { allSalesItems: sItems, allExpensesItems: eItems, allPurchasesItems: pItems };
  }, [sales, expenses, purchases, orders, completedTasks]);

  // 2. Filter & aggregate points according to selected timeframe
  const {
    chartPoints,
    totalPeriodSales,
    totalPeriodExpenses,
    totalPeriodPurchases,
    totalPeriodNet,
    marginPercentage,
    periodLabel,
  } = useMemo(() => {
    const now = new Date();
    let daysToInclude = 30;
    let periodName = "this month";
    let isAllTime = false;

    if (timeframe === "Week") {
      daysToInclude = 7;
      periodName = "this week";
    } else if (timeframe === "Month") {
      daysToInclude = 30;
      periodName = "this month";
    } else if (timeframe === "6 months") {
      daysToInclude = 180;
      periodName = "past 6 mo";
    } else if (timeframe === "Year") {
      daysToInclude = 365;
      periodName = "this year";
    } else if (timeframe === "All") {
      isAllTime = true;
      periodName = "all time";
      // Find earliest date across all items
      const allDates = [
        ...allSalesItems.map((i) => i.date.getTime()),
        ...allExpensesItems.map((i) => i.date.getTime()),
        ...allPurchasesItems.map((i) => i.date.getTime()),
      ].filter((t) => !isNaN(t) && t > 0);

      const earliestTime = allDates.length > 0 ? Math.min(...allDates) : now.getTime() - 180 * 24 * 60 * 60 * 1000;
      const diffDays = Math.max(7, Math.ceil((now.getTime() - earliestTime) / (24 * 60 * 60 * 1000)));
      daysToInclude = diffDays;
    }

    const cutoff = isAllTime ? new Date(0) : new Date(now.getTime() - daysToInclude * 24 * 60 * 60 * 1000);

    const curSales = allSalesItems.filter((item) => item.date >= cutoff);
    const curExpenses = allExpensesItems.filter((item) => item.date >= cutoff);
    const curPurchases = allPurchasesItems.filter((item) => item.date >= cutoff);

    // Initial baseline for pre-cutoff transactions to ensure continuous cumulative tracking
    const initialSales = isAllTime ? 0 : allSalesItems.filter((i) => i.date < cutoff).reduce((sum, i) => sum + i.value, 0);
    const initialExpenses = isAllTime ? 0 : allExpensesItems.filter((i) => i.date < cutoff).reduce((sum, i) => sum + i.value, 0);
    const initialPurchases = isAllTime ? 0 : allPurchasesItems.filter((i) => i.date < cutoff).reduce((sum, i) => sum + i.value, 0);

    const sumSales = (isAllTime ? allSalesItems : curSales).reduce((sum, item) => sum + item.value, 0);
    const sumExpenses = (isAllTime ? allExpensesItems : curExpenses).reduce((sum, item) => sum + item.value, 0);
    const sumPurchases = (isAllTime ? allPurchasesItems : curPurchases).reduce((sum, item) => sum + item.value, 0);
    const sumCosts = sumExpenses + sumPurchases;
    // Profit = Sales - (Expenses + Purchases)
    const sumNet = sumSales - sumCosts;

    const margin = sumSales > 0 ? Math.round((sumNet / sumSales) * 100) : 0;

    const bucketCount = timeframe === "Week" ? 8 : timeframe === "Month" ? 11 : 14;
    const effectiveStartTime = isAllTime
      ? (allSalesItems[0]?.date || allExpensesItems[0]?.date || allPurchasesItems[0]?.date || cutoff).getTime()
      : cutoff.getTime();
    const totalDuration = Math.max(now.getTime() - effectiveStartTime, 24 * 60 * 60 * 1000);
    const bucketDuration = totalDuration / (bucketCount - 1);

    const points: {
      label: string;
      salesVal: number;
      expensesVal: number;
      purchasesVal: number;
      costsVal: number;
      netVal: number;
    }[] = [];

    let runningSales = initialSales;
    let runningExpenses = initialExpenses;
    let runningPurchases = initialPurchases;

    for (let i = 0; i < bucketCount; i++) {
      const bucketStart = new Date(effectiveStartTime + i * bucketDuration);
      const bucketEnd = new Date(effectiveStartTime + (i + 1) * bucketDuration);

      const sInBucket = curSales.filter(
        (item) => item.date >= bucketStart && item.date < bucketEnd
      );
      const eInBucket = curExpenses.filter(
        (item) => item.date >= bucketStart && item.date < bucketEnd
      );
      const pInBucket = curPurchases.filter(
        (item) => item.date >= bucketStart && item.date < bucketEnd
      );

      runningSales += sInBucket.reduce((sum, item) => sum + item.value, 0);
      runningExpenses += eInBucket.reduce((sum, item) => sum + item.value, 0);
      runningPurchases += pInBucket.reduce((sum, item) => sum + item.value, 0);
      const runningCosts = runningExpenses + runningPurchases;

      points.push({
        label: formatNepaliShort(bucketStart),
        salesVal: runningSales,
        expensesVal: runningExpenses,
        purchasesVal: runningPurchases,
        costsVal: runningCosts,
        netVal: runningSales - runningCosts, // Profit = Sales - (Expenses + Purchases)
      });
    }

    // Baseline fallback ONLY if entire dataset is completely empty
    const hasAnyRealData = allSalesItems.length > 0 || allExpensesItems.length > 0 || allPurchasesItems.length > 0;

    if (!hasAnyRealData) {
      const salesMultipliers = [0.25, 0.38, 0.52, 0.58, 0.65, 0.72, 0.81, 0.88, 0.94, 0.98, 1.0];
      const expensesMultipliers = [0.12, 0.17, 0.23, 0.28, 0.31, 0.34, 0.37, 0.41, 0.43, 0.45, 0.47];
      const purchasesMultipliers = [0.06, 0.09, 0.12, 0.14, 0.15, 0.17, 0.18, 0.20, 0.21, 0.22, 0.23];

      const baseSales = 285400;
      const baseExpenses = 110000;
      const basePurchases = 54200;

      points.forEach((p, idx) => {
        const sM = salesMultipliers[idx % salesMultipliers.length];
        const eM = expensesMultipliers[idx % expensesMultipliers.length];
        const pM = purchasesMultipliers[idx % purchasesMultipliers.length];
        p.salesVal = Math.round(baseSales * sM);
        p.expensesVal = Math.round(baseExpenses * eM);
        p.purchasesVal = Math.round(basePurchases * pM);
        p.costsVal = p.expensesVal + p.purchasesVal;
        p.netVal = p.salesVal - p.costsVal;
      });
    }

    const finalSales = hasAnyRealData ? sumSales : (points[points.length - 1]?.salesVal || 0);
    const finalExpenses = hasAnyRealData ? sumExpenses : (points[points.length - 1]?.expensesVal || 0);
    const finalPurchases = hasAnyRealData ? sumPurchases : (points[points.length - 1]?.purchasesVal || 0);
    const finalCosts = finalExpenses + finalPurchases;
    const finalNet = finalSales - finalCosts;

    return {
      chartPoints: points,
      totalPeriodSales: finalSales,
      totalPeriodExpenses: finalExpenses,
      totalPeriodPurchases: finalPurchases,
      totalPeriodCosts: finalCosts,
      totalPeriodNet: finalNet,
      marginPercentage: margin,
      periodLabel: periodName,
    };
  }, [allSalesItems, allExpensesItems, allPurchasesItems, timeframe]);

  // 3. SVG Dimensions & Bezier Curve Calculations
  const svgWidth = 1000;
  const svgHeight = 280;
  const paddingTop = 40;
  const paddingBottom = 40;

  const maxVal = Math.max(
    ...chartPoints.map((p) => Math.max(p.salesVal, p.costsVal)),
    1000
  );
  const minVal = Math.min(
    ...chartPoints.map((p) => Math.min(p.salesVal, p.costsVal, 0))
  );
  const valRange = maxVal - minVal || 1;

  // Normalized coordinates for both series (Sales and Total Costs = Expenses + Purchases)
  const coords = useMemo(() => {
    return chartPoints.map((p, idx) => {
      const x = (idx / (chartPoints.length - 1)) * svgWidth;

      const normSales = (p.salesVal - minVal) / valRange;
      const ySales =
        svgHeight - paddingBottom - normSales * (svgHeight - paddingTop - paddingBottom);

      const normCosts = (p.costsVal - minVal) / valRange;
      const yExpenses =
        svgHeight - paddingBottom - normCosts * (svgHeight - paddingTop - paddingBottom);

      return {
        x,
        ySales,
        yExpenses,
        label: p.label,
        salesVal: p.salesVal,
        expensesVal: p.expensesVal,
        purchasesVal: p.purchasesVal,
        costsVal: p.costsVal,
        netVal: p.netVal,
      };
    });
  }, [chartPoints, minVal, valRange]);

  // Generate Catmull-Rom Bezier Splines for both series
  const { salesLinePath, salesAreaPath, expensesLinePath, expensesAreaPath } = useMemo(() => {
    if (coords.length < 2) {
      return { salesLinePath: "", salesAreaPath: "", expensesLinePath: "", expensesAreaPath: "" };
    }

    let sLine = `M ${coords[0].x} ${coords[0].ySales}`;
    let eLine = `M ${coords[0].x} ${coords[0].yExpenses}`;

    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      // Sales spline
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1yS = p1.ySales + (p2.ySales - p0.ySales) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2yS = p2.ySales - (p3.ySales - p1.ySales) / 6;
      sLine += ` C ${cp1x} ${cp1yS}, ${cp2x} ${cp2yS}, ${p2.x} ${p2.ySales}`;

      // Expenses & Purchases (Total Costs) spline
      const cp1yE = p1.yExpenses + (p2.yExpenses - p0.yExpenses) / 6;
      const cp2yE = p2.yExpenses - (p3.yExpenses - p1.yExpenses) / 6;
      eLine += ` C ${cp1x} ${cp1yE}, ${cp2x} ${cp2yE}, ${p2.x} ${p2.yExpenses}`;
    }

    const lastX = coords[coords.length - 1].x;
    const firstX = coords[0].x;
    const bottomY = svgHeight;

    const sArea = `${sLine} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
    const eArea = `${eLine} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return {
      salesLinePath: sLine,
      salesAreaPath: sArea,
      expensesLinePath: eLine,
      expensesAreaPath: eArea,
    };
  }, [coords]);

  // Precise tracking with cubic smoothstep interpolation
  const updateHoverPosition = (clientX: number) => {
    if (!svgRef.current || coords.length < 2) return;
    const rect = svgRef.current.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(rawX, rect.width));
    const mouseSvgX = (clampedX / rect.width) * svgWidth;

    // Find bounding segment [p1, p2]
    let p1 = coords[0];
    let p2 = coords[1];
    for (let i = 0; i < coords.length - 1; i++) {
      if (mouseSvgX >= coords[i].x && mouseSvgX <= coords[i + 1].x) {
        p1 = coords[i];
        p2 = coords[i + 1];
        break;
      }
    }

    const segmentWidth = p2.x - p1.x || 1;
    const t = Math.max(0, Math.min(1, (mouseSvgX - p1.x) / segmentWidth));
    const smoothT = t * t * (3 - 2 * t);

    const interpYSales = p1.ySales + (p2.ySales - p1.ySales) * smoothT;
    const interpYExpenses = p1.yExpenses + (p2.yExpenses - p1.yExpenses) * smoothT;

    const interpSalesVal = Math.round(p1.salesVal + (p2.salesVal - p1.salesVal) * smoothT);
    const interpExpensesVal = Math.round(
      p1.expensesVal + (p2.expensesVal - p1.expensesVal) * smoothT
    );
    const interpPurchasesVal = Math.round(
      p1.purchasesVal + (p2.purchasesVal - p1.purchasesVal) * smoothT
    );
    const interpCostsVal = interpExpensesVal + interpPurchasesVal;
    // Profit = Sales - (Expenses + Purchases)
    const interpNetVal = interpSalesVal - interpCostsVal;
    const label = t < 0.5 ? p1.label : p2.label;

    setHoveredPoint({
      x: mouseSvgX,
      ySales: interpYSales,
      yExpenses: interpYExpenses,
      label,
      salesVal: interpSalesVal,
      expensesVal: interpExpensesVal,
      purchasesVal: interpPurchasesVal,
      costsVal: interpCostsVal,
      netVal: interpNetVal,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    updateHoverPosition(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches && e.touches[0]) {
      updateHoverPosition(e.touches[0].clientX);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches && e.touches[0]) {
      updateHoverPosition(e.touches[0].clientX);
    }
  };

  const handleLeave = () => {
    setHoveredPoint(null);
  };

  const displaySales = hoveredPoint ? hoveredPoint.salesVal : totalPeriodSales;
  const displayExpenses = hoveredPoint ? hoveredPoint.expensesVal : totalPeriodExpenses;
  const displayPurchases = hoveredPoint ? hoveredPoint.purchasesVal : totalPeriodPurchases;
  const displayNet = hoveredPoint ? hoveredPoint.netVal : totalPeriodNet;

  // Tooltip alignment helper
  const getTooltipPositionStyle = () => {
    if (!hoveredPoint) return {};
    const percentX = (hoveredPoint.x / svgWidth) * 100;
    const minY = Math.min(hoveredPoint.ySales, hoveredPoint.yExpenses);
    const percentY = (minY / svgHeight) * 100;

    let translateX = "-50%";
    if (percentX < 15) translateX = "0%";
    else if (percentX > 85) translateX = "-100%";

    return {
      left: `${percentX}%`,
      top: `${percentY}%`,
      transform: `translate(${translateX}, -100%)`,
      marginTop: "-14px",
    };
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-[32px] overflow-hidden shadow-2xl p-6 sm:p-8 md:p-10 transition-all duration-300 select-none flex flex-col justify-between ${className}`}
      style={{
        background: "linear-gradient(115deg, #F7BA49 0%, #F08B4E 46%, #DE5E56 100%)",
        minHeight: "460px",
      }}
    >
      {/* 1. Top Header Information */}
      <div className="relative z-10 flex flex-col items-start justify-start flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-black/90 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-black/75 font-medium mt-0.5">
              Revenue and business expenses trend over time
            </p>
          </div>

          {/* Quick Stats Pill Badges in Header */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/30 backdrop-blur-xs border border-white/40 text-black text-xs font-semibold shadow-xs">
              <span className="h-2 w-2 rounded-full bg-white shadow-xs" />
              <span>Sales: Rs. {displaySales.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 backdrop-blur-xs border border-black/15 text-black text-xs font-semibold shadow-xs">
              <span className="h-2 w-2 rounded-full bg-orange-600" />
              <span>Expenses: Rs. {displayExpenses.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 backdrop-blur-xs border border-black/15 text-black text-xs font-semibold shadow-xs">
              <span className="h-2 w-2 rounded-full bg-amber-600" />
              <span>Purchases: Rs. {displayPurchases.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-xs border border-black/25 text-black text-xs font-bold shadow-xs">
              <span className={`h-2 w-2 rounded-full ${displayNet >= 0 ? "bg-emerald-600" : "bg-red-600"}`} />
              <span>Net Profit: Rs. {displayNet.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 sm:mt-4">
          <div className="flex items-baseline gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-black/70">
              Net Operating Profit
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-[54px] font-semibold text-black tracking-tight leading-none font-display mt-1">
            {displayNet < 0
              ? `-Rs. ${Math.abs(displayNet).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `Rs. ${displayNet.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </h2>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/15 text-black border border-black/15">
              {marginPercentage >= 0 ? `+${marginPercentage}%` : `${marginPercentage}%`} margin
            </span>
            <span className="text-xs sm:text-sm font-medium text-black/80 capitalize">{periodLabel}</span>
            {hoveredPoint && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-black/15 text-black border border-black/15 transition-all">
                {hoveredPoint.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Dedicated Middle Chart Canvas */}
      <div className="relative w-full flex-1 min-h-[200px] sm:min-h-[230px] md:min-h-[260px] my-3 sm:my-5 overflow-visible">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible cursor-crosshair touch-none"
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleLeave}
        >
          <defs>
            {/* White glow for Sales */}
            <linearGradient id="white-underglow-dual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
              <stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>

            {/* Obsidian dark glow for Outflows (Expenses + Purchases) */}
            <linearGradient id="dark-underglow-dual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181B" stopOpacity="0.18" />
              <stop offset="60%" stopColor="#18181B" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#18181B" stopOpacity="0.0" />
            </linearGradient>

            <filter id="soft-glow-dual" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shaded Areas Under Splines */}
          {salesAreaPath && (
            <path
              d={salesAreaPath}
              fill="url(#white-underglow-dual)"
              className="transition-all duration-300 ease-out pointer-events-none"
            />
          )}

          {expensesAreaPath && (
            <path
              d={expensesAreaPath}
              fill="url(#dark-underglow-dual)"
              className="transition-all duration-300 ease-out pointer-events-none"
            />
          )}

          {/* Costs Line (Sleek Obsidian Spline Wave - Expenses + Purchases) */}
          {expensesLinePath && (
            <path
              d={expensesLinePath}
              fill="none"
              stroke="#18181B"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* Sales Line (Glowing Pure White Spline Wave) */}
          {salesLinePath && (
            <path
              d={salesLinePath}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#soft-glow-dual)"
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* Interactive Crosshair & Dual Pulsing Halo Dots */}
          {hoveredPoint && (
            <g className="transition-all duration-75 pointer-events-none">
              <line
                x1={hoveredPoint.x}
                y1={0}
                x2={hoveredPoint.x}
                y2={svgHeight}
                stroke="#FFFFFF"
                strokeWidth="1.6"
                strokeDasharray="4 4"
                strokeOpacity="0.65"
              />

              {/* 1. Sales Halo Dot (White) */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.ySales}
                r="10"
                fill="#FFFFFF"
                fillOpacity="0.35"
                className="animate-pulse"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.ySales}
                r="5.5"
                fill="#FFFFFF"
                stroke="#18181B"
                strokeWidth="2.5"
              />

              {/* 2. Total Costs Halo Dot (Obsidian) */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.yExpenses}
                r="10"
                fill="#18181B"
                fillOpacity="0.35"
                className="animate-pulse"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.yExpenses}
                r="5.5"
                fill="#18181B"
                stroke="#FFFFFF"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip Pinned Directly Above the Crosshair */}
        {hoveredPoint && (
          <div
            className="absolute z-30 pointer-events-none p-3.5 rounded-2xl bg-black/90 backdrop-blur-md text-white text-xs font-semibold shadow-2xl border border-white/20 transition-all duration-75 flex flex-col gap-1.5 whitespace-nowrap min-w-[190px]"
            style={getTooltipPositionStyle()}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-1">
              <span className="text-gray-300 font-normal text-[11px]">{hoveredPoint.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-white font-bold">
                Cumulative Point
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-white" />
                <span className="font-medium text-gray-200">Revenue (Sales):</span>
              </div>
              <span className="font-bold">Rs. {hoveredPoint.salesVal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                <span className="font-medium text-gray-200">Operating Expenses:</span>
              </div>
              <span className="font-bold">Rs. {hoveredPoint.expensesVal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="font-medium text-gray-200">Material Purchases:</span>
              </div>
              <span className="font-bold">Rs. {hoveredPoint.purchasesVal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-4 text-gray-300 border-t border-white/10 pt-1 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="font-medium">Total Outflows:</span>
              </div>
              <span className="font-bold text-white">Rs. {hoveredPoint.costsVal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/20 pt-1.5 mt-0.5 text-xs">
              <span className="text-emerald-400 font-bold">Net Profit:</span>
              <span
                className={`font-black ${
                  hoveredPoint.netVal >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {hoveredPoint.netVal >= 0 ? "+" : ""}Rs. {hoveredPoint.netVal.toLocaleString()}
              </span>
            </div>

            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 border-solid border-t-black/90 border-t-[6px] border-x-transparent border-x-[6px] border-b-0 w-0 h-0" />
          </div>
        )}
      </div>

      {/* 3. Bottom Navigation Pill Bar */}
      <div className="relative z-20 flex-shrink-0 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar pt-1 pb-0.5">
        <div className="flex items-center gap-2 sm:gap-2.5">
          {(["Week", "Month", "6 months", "Year", "All"] as Timeframe[]).map((tf) => {
            const isActive = timeframe === tf;
            return (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#18181B] text-white shadow-lg shadow-black/25 scale-[1.03]"
                    : "bg-[#FDF3E9]/80 text-[#18181B] hover:bg-[#FDF3E9] hover:scale-[1.02] active:scale-95 shadow-xs backdrop-blur-xs"
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-black/85 bg-white/25 px-3 py-1.5 rounded-xl border border-white/30 backdrop-blur-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-white shadow-xs" />
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-black/85 bg-black/15 px-3 py-1.5 rounded-xl border border-black/15 backdrop-blur-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-[#18181B]" />
            <span>Expenses & Purchases</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-black/90 bg-black/20 px-3 py-1.5 rounded-xl border border-black/20 backdrop-blur-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 shadow-xs" />
            <span>Net Profit</span>
          </div>
        </div>
      </div>
    </div>
  );
};
