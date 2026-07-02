import React, { useState, useEffect } from "react";
import { getDetailedHealth, getPublicHealth } from "../../services/healthService";
import { getAdminUsers, getAdminLeads, getAdminAssessments } from "../../services/assessmentService";
import { getAdminReports } from "../../services/reportService";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import * as icons from "lucide-react";

const parseUtcDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  let s = dateStr.trim();
  if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s = s.replace(" ", "T") + "Z";
  }
  return new Date(s);
};

const calculateChange = (items, daysPeriod) => {
  const now = new Date();
  const msInDay = 24 * 60 * 60 * 1000;

  const currentStart = new Date(now.getTime() - daysPeriod * msInDay);
  const previousStart = new Date(now.getTime() - 2 * daysPeriod * msInDay);

  let currentCount = 0;
  let previousCount = 0;

  items.forEach(item => {
    if (!item.created_at) return;
    const date = parseUtcDate(item.created_at);
    if (date >= currentStart && date <= now) {
      currentCount++;
    } else if (date >= previousStart && date < currentStart) {
      previousCount++;
    }
  });

  if (currentCount === 0 && previousCount === 0) {
    return { change: "Steady", changeType: "neutral" };
  }
  if (previousCount === 0 && currentCount > 0) {
    return { change: "↑ New", changeType: "up" };
  }
  if (currentCount === 0 && previousCount > 0) {
    return { change: "↓ Dropped to 0", changeType: "down" };
  }
  if (currentCount === previousCount) {
    return { change: "Steady", changeType: "neutral" };
  }
  if (currentCount > previousCount) {
    const growth = currentCount / previousCount;
    return { change: `↑ ${growth.toFixed(1)}x`, changeType: "up" };
  }
  if (currentCount < previousCount) {
    const decline = previousCount / currentCount;
    return { change: `↓ ${decline.toFixed(1)}x`, changeType: "down" };
  }

  return { change: "Steady", changeType: "neutral" };
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (!data) return null;
    const label = data.label || "";
    const total = data.total !== undefined ? data.total : 0;
    const newUsers = data.newUsers !== undefined ? data.newUsers : 0;

    return (
      <div className="bg-white/95 backdrop-blur-md border border-zinc-200 rounded-lg p-3 text-[11px] font-medium shadow-lg pointer-events-none">
        <div className="text-zinc-400 font-semibold mb-1.5 uppercase text-[9px] tracking-wider">
          {label}
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#2B7FFF]" />
          <span className="text-zinc-900 font-semibold whitespace-nowrap">
            {total.toLocaleString()} total users
          </span>
        </div>
        {newUsers > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#8EC5FF]" />
            <span className="text-zinc-500 font-medium whitespace-nowrap">
              +{newUsers} new that month
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const getStageName = (lead) => {
  if (lead.report_id || lead.report_generated) return "Stage-5 (retirementsaving)";
  if (lead.flow4_submitted_at) return "Stage-4 (lifestyle goals)";
  if (lead.flow3_submitted_at) return "Stage-3 (familydetails)";
  if (lead.flow2_submitted_at) return "Stage-2 (personaldetails)";
  if (lead.flow1_submitted_at) return "Stage-1 (communication)";
  return "Stage-1 (communication)";
};

export default function Dashboard() {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userGrowthRange, setUserGrowthRange] = useState("12");
  const [showAllCritical, setShowAllCritical] = useState(false);
  const [criticalPage, setCriticalPage] = useState(1);

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalLeads: 0,
    completedAssessments: 0,
    reportsGenerated: 0,
    avgSip: "₹24,500",
    avgInsurance: "₹1.2Cr",
    userGrowth: [],
    assessmentsTrend: [],
    criticalLeads: [],
    usersChange: { change: "Steady", changeType: "neutral" },
    leadsChange: { change: "Steady", changeType: "neutral" },
    completedChange: { change: "Steady", changeType: "neutral" },
    reportsChange: { change: "Steady", changeType: "neutral" }
  });

  const [health, setHealth] = useState({
    uptime: "Loading Uptime...",
    latency: "0ms",
    latencyPct: 10,
    serverStatus: "Checking Connectivity...",
    isOperational: true,
    lastCheck: "Never",
    database: "ok",
    formulaEngine: "ok",
    version: "1.0.0"
  });

  const checkHealth = async () => {
    const startTime = Date.now();
    try {
      let res;
      try {
        res = await getDetailedHealth();
      } catch (err) {
        res = await getPublicHealth();
      }
      const reqDuration = Date.now() - startTime;

      let uptimeStr = "Server Active";
      if (res && res.uptime_seconds !== undefined) {
        const secs = res.uptime_seconds;
        const hrs = Math.floor(secs / 3600);
        const mins = Math.floor((secs % 3600) / 60);
        uptimeStr = `${hrs}h ${mins}m Uptime`;
      }

      const isOk = res && (res.status === "ok" || res.database === "ok");
      const latencyPct = Math.min(100, Math.round((reqDuration / 200) * 100));

      setHealth({
        uptime: uptimeStr,
        latency: `${reqDuration}ms`,
        latencyPct,
        serverStatus: isOk ? "All Systems Operational" : "Service Degraded",
        isOperational: isOk,
        lastCheck: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        database: res?.database || "degraded",
        formulaEngine: res?.formula_engine || "degraded",
        version: res?.version || "1.0.0"
      });
    } catch (error) {
      const reqDuration = Date.now() - startTime;
      const latencyPct = Math.min(100, Math.round((reqDuration / 200) * 100));
      setHealth({
        uptime: "Server Offline",
        latency: `${reqDuration}ms`,
        latencyPct,
        serverStatus: "Connection Offline",
        isOperational: false,
        lastCheck: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        database: "offline",
        formulaEngine: "offline",
        version: "1.0.0"
      });
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [usersRes, leadsRes, assessmentsRes, reportsRes] = await Promise.all([
        getAdminUsers({ per_page: 1000 }).catch(() => ({ data: { items: [] } })),
        getAdminLeads({ per_page: 1000 }).catch(() => ({ data: { items: [] } })),
        getAdminAssessments({ per_page: 1000 }).catch(() => ({ data: { items: [] } })),
        getAdminReports({ per_page: 1000 }).catch(() => ({ data: { items: [] } }))
      ]);

      const usersList = usersRes?.data?.items || usersRes?.items || (Array.isArray(usersRes) ? usersRes : []);
      const leadsList = leadsRes?.data?.items || leadsRes?.items || (Array.isArray(leadsRes) ? leadsRes : []);
      const assessmentsList = assessmentsRes?.data?.items || assessmentsRes?.items || (Array.isArray(assessmentsRes) ? assessmentsRes : []);
      const reportsList = reportsRes?.data?.items || reportsRes?.items || (Array.isArray(reportsRes) ? reportsRes : []);

      const totalU = usersList.length;
      const totalL = leadsList.length;
      const completedA = assessmentsList.length;
      const totalR = reportsList.length;

      const now = new Date();
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const rollingMonths = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        rollingMonths.push({
          name: monthNames[d.getMonth()],
          year: d.getFullYear(),
          monthNum: d.getMonth()
        });
      }

      const monthlyCounts = rollingMonths.map(m => ({ ...m, count: 0 }));
      let runningTotal = 0;
      const windowStartDate = rollingMonths[0] ? new Date(rollingMonths[0].year, rollingMonths[0].monthNum, 1) : new Date(0);

      usersList.forEach(u => {
        if (u.created_at) {
          const date = parseUtcDate(u.created_at);
          if (date < windowStartDate) {
            runningTotal++;
          } else {
            const slot = monthlyCounts.find(m => m.monthNum === date.getMonth() && m.year === date.getFullYear());
            if (slot) {
              slot.count++;
            }
          }
        }
      });

      const userGrowth = monthlyCounts.map(m => {
        runningTotal += m.count;
        return { month: m.name, users: runningTotal, newUsers: m.count };
      });

      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayCounts = {};
      days.forEach(d => { dayCounts[d] = 0; });

      assessmentsList.forEach(a => {
        if (a.created_at) {
          const date = parseUtcDate(a.created_at);
          const d = days[date.getDay()];
          dayCounts[d] = (dayCounts[d] || 0) + 1;
        }
      });

      const assessmentsTrend = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => ({
        day: d,
        count: dayCounts[d] || 0
      }));

      const criticalRaw = leadsList.filter(l => !l.report_id && !l.report_generated);
      const critical = (criticalRaw.length > 0 ? criticalRaw : leadsList).map((l, idx) => ({
        id: l.assessment_id || `lead-${idx}`,
        user: l.name || "Anonymous Lead",
        type: getStageName(l),
        potential: l.flow4_submitted_at ? "₹1.5 - ₹3.0 Cr" : "₹50 - ₹80 L",
        status: l.flow4_submitted_at ? "HIGH PRIORITY" : "REVIEWING"
      }));

      const usersChange = calculateChange(usersList, 30);
      const leadsChange = calculateChange(leadsList, 30);
      const completedChange = calculateChange(assessmentsList, 7);
      const reportsChange = calculateChange(reportsList, 30);

      setDashboardData({
        totalUsers: totalU,
        totalLeads: totalL,
        completedAssessments: completedA,
        reportsGenerated: totalR,
        avgSip: "₹24,500",
        avgInsurance: "₹1.2Cr",
        userGrowth,
        assessmentsTrend,
        criticalLeads: critical,
        usersChange,
        leadsChange,
        completedChange,
        reportsChange
      });
    } catch (error) {
      console.error("[Dashboard] Failed to calculate dynamic metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchDashboardData();
  }, []);

  const kpis = [
    { id: "users", label: "Total Unique Users", value: dashboardData.totalUsers.toLocaleString(), change: dashboardData.usersChange.change, changeType: dashboardData.usersChange.changeType, description: "vs last month", icon: "Users" },
    { id: "leads", label: "Total Leads", value: dashboardData.totalLeads.toLocaleString(), change: dashboardData.leadsChange.change, changeType: dashboardData.leadsChange.changeType, description: "vs last month", icon: "TrendingUp" },
    { id: "completed", label: "Completed Assessments", value: dashboardData.completedAssessments.toLocaleString(), change: dashboardData.completedChange.change, changeType: dashboardData.completedChange.changeType, description: "vs last week", icon: "CheckCircle" },
    { id: "reports", label: "Reports Generated", value: dashboardData.reportsGenerated.toLocaleString(), change: dashboardData.reportsChange.change, changeType: dashboardData.reportsChange.changeType, description: "vs last month", icon: "FileText" }
  ];

  const lineSvgWidth = 640;
  const lineSvgHeight = 260;
  const linePad = { top: 24, right: 16, bottom: 32, left: 44 };
  const chartW = lineSvgWidth - linePad.left - linePad.right;
  const chartH = lineSvgHeight - linePad.top - linePad.bottom;

  const monthsBack = userGrowthRange === "6" ? 6 : 12;
  const userGrowthData = dashboardData.userGrowth.slice(-monthsBack);

  const rawMax = Math.max(...userGrowthData.map((d) => d.users), 1);
  const rawMin = Math.min(...userGrowthData.map((d) => d.users), 0);
  const yPad = Math.max((rawMax - rawMin) * 0.2, 1);
  const yMax = rawMax + yPad;
  const yMin = Math.max(0, rawMin - yPad);
  const yRange = (yMax - yMin) || 1;

  const growthPoints = userGrowthData.map((d, i) => {
    const x = linePad.left + (i * chartW) / (userGrowthData.length - 1 || 1);
    const ratio = (d.users - yMin) / yRange;
    const y = linePad.top + chartH - ratio * chartH;
    return { x, y, label: d.month, total: d.users, newUsers: d.newUsers };
  });

  const buildSmoothPath = (points, tension = 6) => {
    if (points.length < 2) return points.length ? `M ${points[0].x} ${points[0].y}` : "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / tension;
      const cp1y = p1.y + (p2.y - p0.y) / tension;
      const cp2x = p2.x - (p3.x - p1.x) / tension;
      const cp2y = p2.y - (p3.y - p1.y) / tension;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(growthPoints);
  const areaPath = growthPoints.length
    ? `${linePath} L ${growthPoints[growthPoints.length - 1].x} ${linePad.top + chartH} L ${growthPoints[0].x} ${linePad.top + chartH} Z`
    : "";

  const firstMonth = growthPoints[0];
  const latestMonth = growthPoints[growthPoints.length - 1];
  const periodChangeAbs = latestMonth && firstMonth ? latestMonth.total - firstMonth.total : 0;
  const periodChangePct = firstMonth && firstMonth.total > 0
    ? Math.round((periodChangeAbs / firstMonth.total) * 100)
    : null;
  const peakMonth = growthPoints.reduce(
    (max, d) => (d.newUsers > (max?.newUsers ?? -1) ? d : max),
    growthPoints[0]
  );

  const barSvgWidth = 320;
  const barSvgHeight = 200;
  const barPadding = 30;
  const barChartWidth = barSvgWidth - 2 * barPadding;
  const barChartHeight = barSvgHeight - 2 * barPadding;
  const assessmentsTrendData = dashboardData.assessmentsTrend;
  const barMax = Math.max(...assessmentsTrendData.map((d) => d.count)) * 1.1 || 1;

  const assessBarWidth = 24;
  const assessBarGap = (barChartWidth - assessBarWidth * assessmentsTrendData.length) / (assessmentsTrendData.length - 1 || 1);

  const barPoints = assessmentsTrendData.map((d, i) => {
    const x = barPadding + i * (assessBarWidth + assessBarGap);
    const ratio = d.count / barMax;
    const height = ratio * barChartHeight;
    const y = barSvgHeight - barPadding - height;
    return { x, y, width: assessBarWidth, height, label: d.day, value: d.count };
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 animate-fade-in">
        <icons.Loader2 className="w-8 h-8 animate-spin text-[#2B7FFF]" />
        <span className="text-xs font-medium text-zinc-400">Aggregating platform data metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-xs text-zinc-500">Consolidated performance metrics for Wealth Wisdom platform.</p>
        </div>
      </div>

      {/* ===================== KPI CARDS — shadcn "morphed gradient" style ===================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const TrendIcon =
            kpi.changeType === "up" ? icons.TrendingUp :
              kpi.changeType === "down" ? icons.TrendingDown :
                icons.Minus;

          const badgeStyles =
            kpi.changeType === "up"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : kpi.changeType === "down"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-500";

          return (
            <div
              key={kpi.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-t from-[#2B7FFF]/[0.06] via-white to-white p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-zinc-300"
            >
              {/* decorative blurred morph blob — the "transparent morphed" shadcn touch */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#8EC5FF]/25 blur-3xl transition-all duration-300 group-hover:bg-[#2B7FFF]/25 group-hover:scale-110" />
              <div className="pointer-events-none absolute -left-10 bottom-0 h-20 w-20 rounded-full bg-[#2B7FFF]/5 blur-2xl" />

              <div className="relative flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-zinc-500">{kpi.label}</span>
                <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${badgeStyles}`}>
                  <TrendIcon className="h-3 w-3" />
                  {kpi.change}
                </span>
              </div>

              <div className="relative mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
                {kpi.value}
              </div>

              <div className="relative mt-1 text-xs text-zinc-400">
                {kpi.description}
              </div>
            </div>
          );
        })}
      </div>
      {/* ================================================================================== */}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-6 pb-0 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">User Growth Over Time</h3>
              <p className="text-[11px] text-zinc-400">Cumulative users, {monthsBack === 6 ? "last 6 months" : "last 12 months"} through the current month.</p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-md p-1">
              {["6", "12"].map((v) => (
                <button
                  key={v}
                  onClick={() => setUserGrowthRange(v)}
                  className={`px-3 py-1 rounded-sm text-[11px] font-medium transition-all cursor-pointer ${userGrowthRange === v
                    ? "bg-white text-[#2B7FFF] shadow-sm"
                    : "text-zinc-400 hover:text-zinc-600"
                    }`}
                >
                  {v}M
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 pt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-semibold text-zinc-900 tracking-tight">
              {(latestMonth?.total ?? 0).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-zinc-400">total users</span>
            {periodChangePct !== null ? (
              <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${periodChangeAbs >= 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                }`}>
                {periodChangeAbs >= 0 ? <icons.TrendingUp className="w-3 h-3" /> : <icons.TrendingDown className="w-3 h-3" />}
                {periodChangeAbs >= 0 ? "+" : ""}{periodChangePct}% this period
              </span>
            ) : periodChangeAbs > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                <icons.UserPlus className="w-3 h-3" /> +{periodChangeAbs} new
              </span>
            ) : null}
            {peakMonth && peakMonth.newUsers > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border bg-[#2B7FFF]/5 text-[#2B7FFF] border-[#2B7FFF]/20">
                Peak: {peakMonth.label} (+{peakMonth.newUsers})
              </span>
            )}
          </div>

          <div className="w-full h-[260px] px-6 pb-6 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={growthPoints}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                style={{ cursor: "crosshair" }}
              >
                <defs>
                  <linearGradient id="growthAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2B7FFF" stopOpacity="0.25" />
                    <stop offset="95%" stopColor="#2B7FFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#F1F1F3" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  style={{ fontSize: "9px", fill: "#a1a1aa", fontWeight: 500 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  style={{ fontSize: "9px", fill: "#a1a1aa", fontWeight: 500 }}
                  allowDecimals={false}
                />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: "#8EC5FF", strokeWidth: 1.5, strokeDasharray: "3 4" }} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2B7FFF"
                  strokeWidth={2.5}
                  fill="url(#growthAreaGrad)"
                  activeDot={{ r: 5, fill: "#2B7FFF", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assessments Completed (Bar Chart) */}
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Assessments Completed</h3>
            <p className="text-[11px] text-zinc-400">Weekly completion trends.</p>
          </div>

          <div className="relative w-full my-4">
            <svg viewBox={`0 0 ${barSvgWidth} ${barSvgHeight}`} className="w-full h-auto cursor-crosshair">
              {[0, 0.5, 1].map((ratio, index) => {
                const y = barPadding + ratio * barChartHeight;
                return (
                  <line key={index} x1={barPadding} y1={y} x2={barSvgWidth - barPadding} y2={y} stroke="#F4F4F5" strokeWidth="1.5" />
                );
              })}

              {barPoints.map((p, idx) => (
                <g key={idx}>
                  {hoveredBar === idx && (
                    <rect
                      x={p.x - assessBarGap / 2}
                      y={barPadding}
                      width={p.width + assessBarGap}
                      height={barChartHeight}
                      className="fill-zinc-100/60 pointer-events-none"
                      rx="4"
                    />
                  )}
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.width}
                    height={p.height}
                    rx="4"
                    fill="#2B7FFF"
                    className="hover:opacity-90 transition-opacity duration-150 cursor-pointer"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                  <text x={p.x + p.width / 2} y={barSvgHeight - barPadding + 14} textAnchor="middle" className="text-[9px] font-medium fill-zinc-400">
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>

            {hoveredBar !== null && (
              <div
                className="absolute bg-white/95 backdrop-blur-md border border-zinc-200 rounded-lg p-3 text-[11px] font-medium pointer-events-none shadow-lg z-40 transform -translate-x-1/2 -translate-y-[110%] transition-all duration-75"
                style={{
                  left: `${((barPoints[hoveredBar].x + barPoints[hoveredBar].width / 2) / barSvgWidth) * 100}%`,
                  top: `${(barPoints[hoveredBar].y / barSvgHeight) * 100}%`,
                }}
              >
                <div className="text-zinc-400 font-semibold mb-1 uppercase text-[9px] tracking-wider">
                  {barPoints[hoveredBar].label}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2B7FFF]" />
                  <span className="text-zinc-900 font-semibold whitespace-nowrap">
                    {barPoints[hoveredBar].value} Completed
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-xl font-semibold text-zinc-900">{dashboardData.completedAssessments}</span>
            <span className="text-[10px] font-medium text-emerald-600">Active</span>
          </div>
        </div>
      </div>

      {/* Critical Leads & Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-zinc-200 p-6 rounded-xl shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Critical Leads Requiring Action</h3>
              <p className="text-[11px] text-zinc-400">Identified leads needing immediate advisor follow-ups.</p>
            </div>
            {dashboardData.criticalLeads.length > 3 && (
              <button
                onClick={() => {
                  setShowAllCritical(!showAllCritical);
                  setCriticalPage(1);
                }}
                className="text-[11px] text-[#2B7FFF] hover:text-[#2B7FFF]/80 font-medium cursor-pointer"
              >
                {showAllCritical ? "Show Less" : "View All"}
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-zinc-400 font-medium bg-zinc-50/50">
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Assessment Type</th>
                  <th className="py-2.5 px-3">Potential Corpus</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {(() => {
                  const itemsPerPage = 10;
                  const displayedLeads = showAllCritical
                    ? dashboardData.criticalLeads.slice((criticalPage - 1) * itemsPerPage, criticalPage * itemsPerPage)
                    : dashboardData.criticalLeads.slice(0, 3);
                  return displayedLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 px-3 font-medium text-zinc-900">{lead.user}</td>
                      <td className="py-3 px-3 text-zinc-500">{lead.type}</td>
                      <td className="py-3 px-3 font-semibold text-zinc-700">{lead.potential}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-semibold border ${lead.status === "HIGH PRIORITY"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {showAllCritical && dashboardData.criticalLeads.length > 10 && (
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-150">
              <div className="text-[11px] text-zinc-400 font-medium">
                Showing {(criticalPage - 1) * 10 + 1} to {Math.min(criticalPage * 10, dashboardData.criticalLeads.length)} of {dashboardData.criticalLeads.length} critical leads
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCriticalPage((p) => Math.max(1, p - 1))}
                  disabled={criticalPage === 1}
                  className="px-2.5 py-1 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-650 bg-white hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCriticalPage((p) => Math.min(Math.ceil(dashboardData.criticalLeads.length / 10), p + 1))}
                  disabled={criticalPage === Math.ceil(dashboardData.criticalLeads.length / 10)}
                  className="px-2.5 py-1 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-650 bg-white hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Platform Health Status */}
        <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Platform Health</h3>
            <p className="text-[11px] text-zinc-400">Real-time status metrics of services.</p>
          </div>

          <div className="space-y-4 my-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-zinc-500">API Server Uptime</span>
                <span className="text-zinc-900">{health.uptime}</span>
              </div>
              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${health.isOperational ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: health.isOperational ? "100%" : "0%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-zinc-500">API Latency</span>
                <span className="text-zinc-900">{health.latency}</span>
              </div>
              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2B7FFF] h-full rounded-full transition-all duration-300" style={{ width: `${health.latencyPct}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-100 space-y-2 text-[11px] font-medium text-zinc-500">
              <div className="flex justify-between items-center">
                <span>Database Connectivity</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${health.database === "ok" ? "text-emerald-600" : "text-red-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${health.database === "ok" ? "bg-emerald-500" : "bg-red-500"}`} />
                  {health.database === "ok" ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Formula Calculation Engine</span>
                <span className={`inline-flex items-center gap-1 font-semibold ${health.formulaEngine === "ok" ? "text-emerald-600" : "text-red-600"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${health.formulaEngine === "ok" ? "bg-emerald-500" : "bg-red-500"}`} />
                  {health.formulaEngine === "ok" ? "Active" : "Degraded"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>App Build Version</span>
                <span className="font-medium text-zinc-600 font-mono">v{health.version}</span>
              </div>
            </div>
          </div>

          <div className={`flex items-center gap-3 border p-3 rounded-lg ${health.isOperational ? "bg-emerald-50/50 border-emerald-100" : "bg-red-50/50 border-red-100"
            }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm animate-pulse font-semibold ${health.isOperational ? "bg-emerald-500" : "bg-red-500"
              }`}>
              {health.isOperational ? "✓" : "!"}
            </div>
            <div>
              <span className="block text-xs font-semibold text-zinc-900">{health.serverStatus}</span>
              <span className="block text-[9px] text-zinc-400 font-medium">Last check: {health.lastCheck}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}