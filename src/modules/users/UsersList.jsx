import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, Eye, Calendar, Award, Briefcase, Heart, User, Download, Loader2, FileSpreadsheet, FileText, TrendingUp, ChevronDown, X } from "lucide-react";

const parseUtcDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  let s = dateStr.trim();
  if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s = s.replace(" ", "T") + "Z";
  }
  return new Date(s);
};

const getDisplayVal = (val) => {
  if (!val) return "N/A";
  if (typeof val === "object") {
    return val.display || val.inr || (val.raw !== undefined ? val.raw.toLocaleString("en-IN") : "N/A");
  }
  return typeof val === "number" ? val.toLocaleString("en-IN") : val;
};

// Pulls a raw numeric value out of whatever shape a figure arrives in
// (plain number, "₹1,23,456" string, or { raw, display } object).
const toNumber = (val) => {
  if (val === null || val === undefined) return 0;
  if (typeof val === "object") {
    if (typeof val.raw === "number") return val.raw;
    if (typeof val.raw === "string") return parseFloat(val.raw.replace(/[^0-9.-]/g, "")) || 0;
    if (typeof val.display === "string") return parseFloat(val.display.replace(/[^0-9.-]/g, "")) || 0;
    return 0;
  }
  if (typeof val === "number") return val;
  if (typeof val === "string") return parseFloat(val.replace(/[^0-9.-]/g, "")) || 0;
  return 0;
};

// Coverage = how much of the required retirement corpus is already funded.
const getCoverage = (block) => {
  if (!block) return null;
  const required = toNumber(block.total_required_corpus);
  const covered = toNumber(block.projected_pf_corpus);
  if (!required) return null;
  return { pct: Math.max(0, Math.min(100, (covered / required) * 100)), required, covered };
};

// Fires `ready = true` a beat after mount, so any child chart animates its
// fill/stroke in — and replays every time this remounts (e.g. a tab switch).
const FillOnMount = ({ children }) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setTimeout(() => setReady(true), 60));
    return () => cancelAnimationFrame(raf);
  }, []);
  return children(ready);
};

// Apple-Watch-style radial progress ring, used for corpus coverage.
const RadialGauge = ({ pct = 0, ready = false, size = 108, strokeWidth = 10, colorFrom, colorTo, trackColor = "#FEE2E2", gradId, centerLabel, centerSub }) => {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (ready ? Math.max(0, Math.min(100, pct)) : 0) / 100 * circumference;
  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={`url(#${gradId})`} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="ww-figure text-lg font-extrabold text-zinc-800 leading-none">{Math.round(pct)}%</span>
        {centerLabel && <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wide mt-1">{centerLabel}</span>}
        {centerSub && <span className="text-[9px] text-zinc-400">{centerSub}</span>}
      </div>
    </div>
  );
};

// Single bar split into "today's cost" vs "inflation growth to target year" —
// makes the effect of inflation on a goal visible at a glance.
const InflationBar = ({ today, future, ready }) => {
  const pct = future > 0 ? Math.min(100, (today / future) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wide">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400" /> Today's Cost</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF]" /> Inflation Growth</span>
      </div>
      <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex">
        <div className="h-full bg-zinc-400 transition-all duration-[900ms] ease-out" style={{ width: ready ? `${pct}%` : "0%" }} />
        <div className="h-full bg-gradient-to-r from-[#2B7FFF] to-indigo-400 transition-all duration-[900ms] ease-out" style={{ width: ready ? `${100 - pct}%` : "0%" }} />
      </div>
    </div>
  );
};

import {
  getAdminUsers,
  getAdminLeads,
  getAdminAssessments,
  exportAdminAssessment,
  exportAdminUsers,
  exportAdminAssessments,
  getAssessment
} from "../../services/assessmentService";
import { downloadAdminReportWithFilename } from "../../services/reportService";
import { useToast } from "../../components/UI/Toast";
import { logAction } from "../../utils/activityLogger";

const DETAIL_TABS = [
  { id: "overview", label: "Overview", icon: User },
  { id: "financials", label: "Financials", icon: Award },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "activity", label: "Activity", icon: Calendar },
];

// Duration of the genie open/close transition — keep in sync with the CSS
// animation timings declared in the <style> block below.
const GENIE_DURATION = 520;

export default function UsersList({ globalSearch = "", setGlobalSearch = () => { } }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [search, setSearch] = useState(globalSearch);

  useEffect(() => {
    Promise.resolve().then(() => setSearch(globalSearch));
  }, [globalSearch]);
  const [statusFilter, setStatusFilter] = useState("All"); // All, Leads, Completed
  const [showFreeLeadsOnly, setShowFreeLeadsOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingDetailId, setLoadingDetailId] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [downloadingExcelId, setDownloadingExcelId] = useState(null);
  const [exportingUsers, setExportingUsers] = useState(false);
  const [exportingAssessments, setExportingAssessments] = useState(false);
  const { showToast } = useToast();

  // Genie effect state — the origin point (in viewport px) the drawer should
  // appear to expand out of / collapse back into, plus a closing flag so we
  // can play the reverse animation before actually unmounting the drawer.
  const [genieOrigin, setGenieOrigin] = useState({ x: "92%", y: "50%" });
  const [isClosing, setIsClosing] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (selectedUser) setActiveTab("overview");
  }, [selectedUser]);

  const parseAssessmentRecord = (rec) => {
    return {
      id: rec.assessment_id || rec.id,
      name: rec.name || "Anonymous Client",
      role: "Planning Client",
      designation: "Client",
      companyName: "N/A",
      dob: "N/A",
      age: "N/A",
      maritalStatus: "N/A",
      targetRetireAge: 60,

      email: rec.email || "N/A",
      phone: rec.phone || "N/A",
      address: "N/A",
      consent: true,

      spouseName: "",
      spouseAge: "N/A",
      spouseOccupation: "",
      spouseDesignation: "",
      spouseCompanyName: "",
      spouseDob: "",

      childrenCount: 0,
      children: [],

      flow4SubmittedAt: rec.flow4_submitted_at || null,
      reportGenerated: rec.report_generated !== undefined ? !!rec.report_generated : (rec.report_id ? true : false),

      status: rec.report_id ? "Completed" : "Lead",
      createdDate: rec.created_at ? parseUtcDate(rec.created_at).toLocaleDateString("en-IN") : "N/A",
      createdAtRaw: rec.created_at || null,
      reportId: rec.report_id || null,
      downloadPath: rec.download_path || null,

      projections: {
        sip: "₹24,500",
        corpus: "5.2",
        insurance: "1.2",
        equity: 60,
        debt: 30,
        commodities: 10
      },

      goals: [],

      activities: [
        {
          type: "Assessment Created",
          date: rec.created_at ? parseUtcDate(rec.created_at).toLocaleDateString() : "Just now",
          summary: "Assessment intake record initiated via client application.",
          actor: "Client Portal"
        }
      ]
    };
  };

  const loadAssessments = useCallback(async () => {
    setErrorMsg(null);
    try {
      console.log(`[UsersList] Fetching all records for statusFilter: ${statusFilter}...`);
      let response;
      const params = { per_page: 1000 };

      if (statusFilter === "All" || statusFilter === "Leads") {
        response = await getAdminLeads(params);
      } else if (statusFilter === "Completed") {
        response = await getAdminAssessments(params);
      }

      console.log("[UsersList] API Response received:", response);

      let rawList = null;
      if (response) {
        const dataPayload = response.data || response;
        if (dataPayload) {
          rawList = dataPayload.items || (Array.isArray(dataPayload) ? dataPayload : null);
        }
      }

      if (Array.isArray(rawList)) {
        const parsedList = rawList.map((item) => parseAssessmentRecord(item));
        parsedList.sort((a, b) => {
          const timeA = a.flow4SubmittedAt ? parseUtcDate(a.flow4SubmittedAt).getTime() : (a.createdAtRaw ? parseUtcDate(a.createdAtRaw).getTime() : 0);
          const timeB = b.flow4SubmittedAt ? parseUtcDate(b.flow4SubmittedAt).getTime() : (b.createdAtRaw ? parseUtcDate(b.createdAtRaw).getTime() : 0);
          return timeB - timeA;
        });
        console.log("[UsersList] Completed parsing and sorting assessments list. Count:", parsedList.length);
        setUsers(parsedList);
      } else {
        console.warn("[UsersList] Could not find items array in response. Setting users to empty.");
        setUsers([]);
      }
    } catch (err) {
      console.error("[UsersList] loadAssessments failed:", err);
      setErrorMsg(err.message || "Failed to query assessments from backend.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    Promise.resolve().then(() => setCurrentPage(1));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAssessments();
  }, [statusFilter, loadAssessments]);

  const handleViewDetails = async (user, event) => {
    if (loadingDetailId) return;

    // Capture where the click happened so the genie effect can expand out of
    // (and later collapse back into) that exact spot.
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect
        ? event.currentTarget.getBoundingClientRect()
        : null;
      if (rect) {
        setGenieOrigin({
          x: `${rect.left + rect.width / 2}px`,
          y: `${rect.top + rect.height / 2}px`,
        });
      }
    }

    setLoadingDetailId(user.id);
    try {
      const response = await getAssessment(user.id);
      const resData = response.data || response;
      const assessmentData = resData.data || resData;

      console.log("[handleViewDetails] RAW response:", response);
      console.log("[handleViewDetails] resData:", resData);
      console.log("[handleViewDetails] assessmentData:", assessmentData);

      const detailedUser = {
        id: assessmentData.assessment_id || user.id,
        name: assessmentData.flow2?.client_name || user.name || "Anonymous Client",
        role: "Planning Client",
        occupation: assessmentData.flow2?.client_occupation || "N/A",
        designation: assessmentData.flow2?.client_designation || "Client",
        companyName: assessmentData.flow2?.client_company || "N/A",
        dob: assessmentData.flow2?.client_dob ? new Date(assessmentData.flow2.client_dob).toLocaleDateString("en-IN") : "N/A",
        age: assessmentData.flow2?.client_age ? `${assessmentData.flow2.client_age} Years` : "N/A",
        maritalStatus: assessmentData.flow2?.spouse_name ? "Married" : "Single",
        targetRetireAge: assessmentData.flow2?.client_retirement_age || 60,

        email: assessmentData.flow1?.email || user.email || "N/A",
        phone: assessmentData.flow1?.mobile || user.phone || "N/A",
        address: assessmentData.flow1?.residential_address || "N/A",
        consent: assessmentData.flow1?.consent ?? true,

        spouseName: assessmentData.flow2?.spouse_name || "",
        spouseAge: assessmentData.flow2?.spouse_age ? `${assessmentData.flow2.spouse_age} Years` : "N/A",
        spouseOccupation: assessmentData.flow2?.spouse_occupation || "",
        spouseDesignation: assessmentData.flow2?.spouse_designation || "",
        spouseCompanyName: assessmentData.flow2?.spouse_company || "",
        spouseDob: assessmentData.flow2?.spouse_dob || "",

        childrenCount: assessmentData.flow3?.number_of_children || 0,
        children: (assessmentData.flow3?.children || []).map((c) => ({
          name: c.full_name || "",
          dob: c.date_of_birth ? new Date(c.date_of_birth).toLocaleDateString("en-IN") : "N/A",
          age: c.calculated_age ? `${c.calculated_age} Years` : "N/A",
          occupation: c.occupation || "N/A",
          dependent: c.financially_dependent ?? true,
        })),

        status: user.status,
        reportId: user.reportId,

        goals: (assessmentData.flow4?.goals || []).map((g) => ({
          id: g.id,
          type: g.goal_type || "",
          targetYear: g.target_year || "",
          todaysCostRaw: g.today_cost || 0,
          futureCostRaw: g.future_cost || 0,
          todaysCost: g.today_cost ? `₹${g.today_cost.toLocaleString("en-IN")}` : "N/A",
          futureCost: g.future_cost ? `₹${Math.round(g.future_cost).toLocaleString("en-IN")}` : "N/A",
          monthlySip: g.monthly_sip ? `₹${Math.round(g.monthly_sip).toLocaleString("en-IN")}` : "N/A",
          inflationRate: g.inflation_rate ? `${(g.inflation_rate * 100).toFixed(0)}%` : "6%",
          progress: g.monthly_sip ? 100 : 0,
        })),

        calculation: assessmentData.calculation || null,
        reports: assessmentData.reports || [],
        activities: user.activities || [],
      };

      setSelectedUser(detailedUser);
      logAction(`Viewed assessment details for client: '${user.name}' (ID: ${user.id})`);
    } catch (err) {
      console.error("Failed to load assessment details:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to load assessment details.";
      showToast(errMsg, "error");
    } finally {
      setLoadingDetailId(null);
    }
  };

  // Plays the reverse-genie collapse animation, then unmounts the drawer
  // once it's finished shrinking back into the origin point.
  const handleCloseDrawer = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setSelectedUser(null);
      setIsClosing(false);
    }, GENIE_DURATION);
  };

  const downloadReportFile = async (reportId) => {
    if (!reportId) return;
    setDownloadingReportId(reportId);
    try {
      const { blob, fileName } = await downloadAdminReportWithFilename(reportId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Report PDF downloaded successfully.", "success");
      logAction(`Downloaded report PDF file: '${fileName}' (Report ID: ${reportId})`);
    } catch (error) {
      console.error("Failed to download admin report:", error);
      showToast(error.message || "Failed to download PDF report.", "error");
    } finally {
      setDownloadingReportId(null);
    }
  };

  const downloadAssessmentExcel = async (assessmentId) => {
    if (!assessmentId) return;
    setDownloadingExcelId(assessmentId);
    showToast("Preparing Excel export for assessment...", "info");
    try {
      const response = await exportAdminAssessment(assessmentId);
      console.log(`[Excel Download] Assessment ${assessmentId} Export Response Blob data:`, response);
      const url = URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `assessment-export-${assessmentId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Excel export downloaded successfully!", "success");
      logAction(`Exported assessment ID ${assessmentId} to Excel`);
    } catch (error) {
      console.error("Failed to download assessment Excel:", error);
      showToast("Failed to download Excel report: " + error.message, "error");
    } finally {
      setDownloadingExcelId(null);
    }
  };

  const downloadUsersExcel = async () => {
    setExportingUsers(true);
    showToast("Exporting all users to Excel...", "info");
    try {
      const response = await exportAdminUsers();
      console.log("[Excel Download] Users Export Response Blob data:", response);
      const url = URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `users-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Users list exported successfully!", "success");
      logAction("Exported all client users to Excel spreadsheet");
    } catch (error) {
      console.error("Failed to export users to Excel:", error);
      showToast("Failed to export users: " + error.message, "error");
    } finally {
      setExportingUsers(false);
    }
  };

  const downloadAssessmentsExcel = async () => {
    setExportingAssessments(true);
    showToast("Exporting all assessments to Excel...", "info");
    try {
      const response = await exportAdminAssessments();
      console.log("[Excel Download] Assessments Export Response Blob data:", response);
      const url = URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `assessments-export-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Assessments list exported successfully!", "success");
      logAction("Exported all client assessments to Excel spreadsheet");
    } catch (error) {
      console.error("Failed to export assessments to Excel:", error);
      showToast("Failed to export assessments: " + error.message, "error");
    } finally {
      setExportingAssessments(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.phone || "").includes(search);

    if (!matchesSearch) return false;

    if (statusFilter === "Leads") {
      if (showFreeLeadsOnly) {
        return user.flow4SubmittedAt && !user.reportGenerated;
      }
      return !user.reportId && !user.reportGenerated;
    }

    return true;
  });

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeTabIndex = DETAIL_TABS.findIndex((t) => t.id === activeTab);

  return (
    <div className="ww-page">
      {/* Page Header */}
      <div className="ww-page-header">
        <div>
          <h2 className="ww-page-title">Users & Assessments</h2>
          <p className="ww-page-subtitle">Manage client data and financial assessment statuses.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadUsersExcel}
            disabled={exportingUsers}
            className="ww-secondary-btn flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download all users to Excel"
          >
            {exportingUsers ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            )}
            Export Users Excel
          </button>
          <button
            type="button"
            onClick={downloadAssessmentsExcel}
            disabled={exportingAssessments}
            className="ww-secondary-btn flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download all assessments to Excel"
          >
            {exportingAssessments ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            )}
            Export Assessments Excel
          </button>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="bg-white border border-zinc-200 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Filter by name, email, phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setGlobalSearch(e.target.value);
            }}
            className="bg-transparent border-none text-xs text-zinc-700 outline-none w-full placeholder-slate-400"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-4 shrink-0">
          {statusFilter === "Leads" && (
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 cursor-pointer select-none bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors">
              <input
                type="checkbox"
                checked={showFreeLeadsOnly}
                onChange={(e) => setShowFreeLeadsOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#2B7FFF] accent-[#2B7FFF] rounded cursor-pointer"
              />
              <span>Free Leads Only</span>
            </label>
          )}

          <div className="flex bg-zinc-50 border border-zinc-200 rounded-xl p-1">
            {["All", "Leads", "Completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setLoading(true);
                  setStatusFilter(tab);
                  if (tab !== "Leads") setShowFreeLeadsOnly(false);
                }}
                className={`px-4 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${statusFilter === tab
                  ? "bg-white text-[#2B7FFF] shadow-xs"
                  : "text-zinc-500 hover:text-zinc-700"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="ww-panel">
        <div className="overflow-x-auto">
          <table className="ww-table">
            <thead>
              <tr className="ww-table-head">
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2B7FFF] mx-auto mb-2" />
                    <p className="font-semibold text-xs text-slate-505">Querying real backend assessments database...</p>
                  </td>
                </tr>
              ) : errorMsg ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-rose-500">
                    <p className="font-bold text-sm">Failed to Load Assessments</p>
                    <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>
                    <button
                      type="button"
                      onClick={loadAssessments}
                      className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Retry Query
                    </button>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-zinc-400">
                    <p className="font-semibold text-sm">No clients found</p>
                    <p className="text-xs text-zinc-400 mt-1">Try resetting your search filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user, index) => (
                  <tr
                    key={`${user.id || user.email}-${index}`}
                    onClick={(e) => handleViewDetails(user, e)}
                    className="hover:bg-zinc-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-semibold text-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2B7FFF]/5 border border-[#2B7FFF]/10 flex items-center justify-center text-[#2B7FFF] font-bold shrink-0">
                          {user.name ? user.name.split(" ").map((n) => n[0]).join("") : "U"}
                        </div>
                        <div>
                          <span className="block text-zinc-800 font-bold group-hover:text-[#2B7FFF] transition-colors">
                            {user.name}
                          </span>
                          <span className="block text-[10px] text-zinc-400 font-normal">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-medium">{user.email}</td>
                    <td className="py-4 px-4 text-zinc-500 font-medium">{user.phone}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${user.status === "Completed"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-400 font-medium">{user.createdDate}</td>
                    <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1.5 items-center">
                        <button
                          onClick={(e) => handleViewDetails(user, e)}
                          disabled={loadingDetailId !== null}
                          className="px-2.5 py-1 hover:bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold text-[#2B7FFF] hover:text-[#2B7FFF]/80 cursor-pointer transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {loadingDetailId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                          {loadingDetailId === user.id ? "Loading..." : "View Details"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadAssessmentExcel(user.id);
                          }}
                          disabled={downloadingExcelId === user.id}
                          className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Export row-wise Excel"
                        >
                          {downloadingExcelId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                          )}
                          Excel
                        </button>
                        {user.reportId ? (
                          <button
                            onClick={() => downloadReportFile(user.reportId)}
                            disabled={downloadingReportId === user.reportId}
                            className="px-2.5 py-1 bg-[#2B7FFF]/5 border border-[#2B7FFF]/10 hover:bg-indigo-100 disabled:bg-zinc-100 rounded-lg text-[10px] font-bold text-[#2B7FFF] hover:text-[#2B7FFF]/80 cursor-pointer transition-colors inline-flex items-center gap-1.5 disabled:cursor-not-allowed"
                            title="Download PDF Report"
                          >
                            {downloadingReportId === user.reportId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                            PDF
                          </button>
                        ) : (
                          <div className="px-2.5 py-1 border border-transparent text-[10px] font-bold inline-flex items-center gap-1.5 select-none invisible">
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!loading && !errorMsg && totalItems > 0 && (
          <div className="border-t border-zinc-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/30">
            <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-zinc-200 rounded-lg px-2 py-1 text-zinc-700 font-semibold outline-none cursor-pointer hover:border-slate-300 transition-colors"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>entries</span>
              <span className="w-1.5 h-1.5 bg-zinc-200 rounded-full mx-1" />
              <span>
                Showing <span className="font-bold text-zinc-800">{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</span> to{" "}
                <span className="font-bold text-zinc-800">{Math.min(totalItems, currentPage * pageSize)}</span> of{" "}
                <span className="font-bold text-zinc-800">{totalItems}</span> entries
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="text-zinc-400 text-xs px-1">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${currentPage === p
                          ? "bg-[#2B7FFF] text-white shadow-sm"
                          : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                          }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================= */}
      {/*  Glassmorphic, tabbed assessment detail drawer     */}
      {/* ================================================= */}
      {(selectedUser || isClosing) && createPortal(
        <div
          className="fixed inset-0 z-50 flex justify-end ww-drawer-root"
          style={{ "--genie-x": genieOrigin.x, "--genie-y": genieOrigin.y }}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

            .ww-drawer-root { font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; }
            .ww-heading { font-family: 'Inter Tight', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif; letter-spacing: -0.01em; }
            .ww-figure { font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }

            @keyframes wwOverlayIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes wwOverlayOut { from { opacity: 1; } to { opacity: 0; } }

            /* --- macOS "genie" open/close --- the panel appears to pour out
               of (and suck back into) the point the user clicked, using a
               clip-path squeeze + skew + scale sequence rather than a plain
               fade/slide. transform-origin is pinned to --genie-x/--genie-y
               so the effect always anchors to that spot. */
            @keyframes wwGenieOpen {
              0% {
                opacity: 0.4;
                transform: translate(calc(var(--genie-x) - 100%), calc(var(--genie-y) - 100%)) scale(0.05, 0.04) skewY(18deg);
                clip-path: inset(0% 0% 0% 60% round 40px);
                filter: blur(3px);
              }
              45% {
                opacity: 1;
                transform: translate(0, 0) scale(1.02, 0.9) skewY(-4deg);
                clip-path: inset(0% 0% 0% 0% round 30px);
                filter: blur(0px);
              }
              70% {
                transform: translate(0, 0) scale(0.99, 1.03) skewY(1.5deg);
              }
              100% {
                opacity: 1;
                transform: translate(0, 0) scale(1, 1) skewY(0deg);
                clip-path: inset(0% 0% 0% 0% round 0px);
                filter: blur(0px);
              }
            }
            @keyframes wwGenieClose {
              0% {
                opacity: 1;
                transform: translate(0, 0) scale(1, 1) skewY(0deg);
                clip-path: inset(0% 0% 0% 0% round 0px);
                filter: blur(0px);
              }
              55% {
                opacity: 1;
                transform: translate(0, 0) scale(1.02, 0.85) skewY(-6deg);
                clip-path: inset(0% 0% 0% 25% round 40px);
                filter: blur(1px);
              }
              100% {
                opacity: 0;
                transform: translate(calc(var(--genie-x) - 100%), calc(var(--genie-y) - 100%)) scale(0.04, 0.03) skewY(20deg);
                clip-path: inset(0% 0% 0% 65% round 40px);
                filter: blur(4px);
              }
            }

            @keyframes wwCardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes wwDotGlow { 0%,100% { opacity: 1; } 50% { opacity: 0.55; } }

            .ww-overlay { animation: wwOverlayIn 0.32s ease both; }
            .ww-overlay-closing { animation: wwOverlayOut 0.4s ease both; }
            .ww-panel-enter {
              transform-origin: var(--genie-x) var(--genie-y);
              animation: wwGenieOpen ${GENIE_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1) both;
            }
            .ww-panel-exit {
              transform-origin: var(--genie-x) var(--genie-y);
              animation: wwGenieClose ${GENIE_DURATION}ms cubic-bezier(0.5, 0, 0.75, 0) both;
            }
            .ww-card-in { animation: wwCardIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both; }
            .ww-traffic-dot:hover { animation: wwDotGlow 1s infinite; }

            /* Frosted, neumorphic "widget" glass — soft dual-tone shadow
               (inset light top-edge highlight + ambient drop shadow) on top
               of a heavier blur/saturate so content behind genuinely reads
               through, matching the iOS/macOS widget reference look. */
            .ww-glass {
              background: linear-gradient(155deg, rgba(255,255,255,0.68), rgba(255,255,255,0.32));
              backdrop-filter: blur(28px) saturate(190%);
              -webkit-backdrop-filter: blur(28px) saturate(190%);
              border: 1px solid rgba(255,255,255,0.65);
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.85),
                inset 0 -12px 20px -14px rgba(15,23,42,0.06),
                0 1px 1px rgba(15,23,42,0.03),
                0 22px 45px -22px rgba(15,23,42,0.24);
            }
            .ww-glass-tint {
              background: rgba(255,255,255,0.4);
              backdrop-filter: blur(18px) saturate(170%);
              -webkit-backdrop-filter: blur(18px) saturate(170%);
              border: 1px solid rgba(255,255,255,0.55);
              box-shadow: inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 6px rgba(15,23,42,0.03);
            }
            /* Inner "chip" surface used for rows/mini-cards inside a .ww-glass
               panel — translucent frosted layer rather than flat white, with
               a subtle embossed edge so it reads as a raised widget tile. */
            .ww-chip {
              background: linear-gradient(160deg, rgba(255,255,255,0.55), rgba(255,255,255,0.22));
              backdrop-filter: blur(14px) saturate(160%);
              -webkit-backdrop-filter: blur(14px) saturate(160%);
              border: 1px solid rgba(255,255,255,0.55);
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.8),
                inset 0 -6px 12px -10px rgba(15,23,42,0.08),
                0 10px 24px -16px rgba(15,23,42,0.22);
            }
            .ww-lift { transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease; }
            .ww-lift:hover { transform: translateY(-3px); box-shadow: 0 20px 40px -20px rgba(15,23,42,0.28); }
            .ww-row-hover { transition: background-color 0.2s ease; }
          `}</style>

          {/* Overlay backdrop */}
          <div
            onClick={handleCloseDrawer}
            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-md ${isClosing ? "ww-overlay-closing" : "ww-overlay"}`}
          />

          {/* Sliding / genie-morphing Panel Body */}
          <div
            className={`ww-drawer-root ${isClosing ? "ww-panel-exit" : "ww-panel-enter"} relative w-full max-w-xl md:max-w-2xl h-full shadow-2xl flex flex-col z-10 border-l border-white/40`}
            style={{ background: "radial-gradient(circle at 100% 0%, rgba(43,127,255,0.07), transparent 55%), radial-gradient(circle at 0% 100%, rgba(168,85,247,0.06), transparent 55%), #F6F7FA" }}
          >
            {/* Mac-style window chrome header — single red "close" control */}
            <div className="h-14 ww-glass border-b border-white/50 px-5 flex items-center justify-between shrink-0 relative z-20">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCloseDrawer}
                  title="Close"
                  className="ww-traffic-dot w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 ring-1 ring-rose-500/20 cursor-pointer transition-colors flex items-center justify-center group"
                >
                  <X className="w-3 h-3 text-rose-50 group-hover:text-white" strokeWidth={3} />
                </button>
                <span className="ml-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 ww-heading">
                  Assessment Detail
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 ww-figure truncate max-w-[140px]">{selectedUser?.id}</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-4">

                {/* Client identity card */}
                <div className="ww-glass ww-card-in rounded-[26px] p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-lg ww-heading ring-4 ${selectedUser?.status === "Completed"
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-500 text-white ring-emerald-100"
                        : "bg-gradient-to-br from-amber-300 to-amber-400 text-white ring-amber-100"
                        }`}>
                        {selectedUser?.name ? selectedUser.name.split(" ").map((n) => n[0]).join("").slice(0, 2) : "U"}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${selectedUser?.status === "Completed" ? "bg-emerald-500" : "bg-amber-500"
                        }`} />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase block mb-0.5">Client Profile</span>
                      <h3 className="text-lg font-extrabold text-zinc-900 leading-tight ww-heading truncate">{selectedUser?.name}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => downloadAssessmentExcel(selectedUser?.id)}
                      disabled={downloadingExcelId === selectedUser?.id}
                      className="ww-lift w-9 h-9 rounded-full bg-emerald-500/90 hover:bg-emerald-600 disabled:bg-emerald-300 text-white flex items-center justify-center cursor-pointer shadow-sm disabled:cursor-not-allowed"
                      title="Export to Excel"
                    >
                      {downloadingExcelId === selectedUser?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    </button>
                    {selectedUser?.reportId && (
                      <button
                        type="button"
                        onClick={() => downloadReportFile(selectedUser.reportId)}
                        disabled={downloadingReportId === selectedUser.reportId}
                        className="ww-lift w-9 h-9 rounded-full bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 disabled:bg-zinc-200 text-white flex items-center justify-center cursor-pointer shadow-sm disabled:cursor-not-allowed"
                        title="Download PDF report"
                      >
                        {downloadingReportId === selectedUser.reportId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Segmented macOS-style tab bar (sticky) */}
                <div className="sticky top-0 z-10 pt-1 pb-1 ww-card-in" style={{ animationDelay: "60ms" }}>
                  <div className="relative grid grid-cols-4 gap-1 p-1 rounded-2xl bg-zinc-200/50 ww-glass-tint">
                    <div
                      className="absolute top-1 bottom-1 rounded-xl bg-white/80 backdrop-blur-md shadow-[0_2px_10px_rgba(15,23,42,0.14)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      style={{ left: `calc(${activeTabIndex} * 25% + 4px)`, width: "calc(25% - 8px)" }}
                    />
                    {DETAIL_TABS.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`relative z-10 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-xl transition-colors cursor-pointer ${activeTab === tab.id ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                            }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="hidden xs:inline">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedUser && (
                  <>
                    {/* ---------------- OVERVIEW TAB ---------------- */}
                    {activeTab === "overview" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="ww-glass ww-lift ww-card-in rounded-[22px] p-4" style={{ animationDelay: "40ms" }}>
                            <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 pb-2.5 mb-1 border-b border-zinc-200/60 ww-heading">
                              <User className="w-4 h-4" /> Personal Details
                            </h4>
                            <div className="text-xs font-medium">
                              {[
                                ["Occupation", `${selectedUser.occupation} (${selectedUser.designation})`],
                                ["Company", selectedUser.companyName],
                                ["Date of Birth", `${selectedUser.dob} · ${selectedUser.age}`],
                                ["Marital Status", selectedUser.maritalStatus],
                                ["Retirement Age", `${selectedUser.targetRetireAge} Years`],
                              ].map(([label, value]) => (
                                <div key={label} className="ww-row-hover flex justify-between items-center py-1.5 px-2 -mx-2 rounded-lg hover:bg-white/40">
                                  <span className="text-zinc-400">{label}</span>
                                  <span className="text-zinc-800 font-bold text-right">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="ww-glass ww-lift ww-card-in rounded-[22px] p-4" style={{ animationDelay: "90ms" }}>
                            <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 pb-2.5 mb-1 border-b border-zinc-200/60 ww-heading">
                              <Briefcase className="w-4 h-4" /> Contact Channels
                            </h4>
                            <div className="text-xs font-medium">
                              {[
                                ["Email Address", selectedUser.email],
                                ["Primary Phone", selectedUser.phone],
                                ["Mailing Address", selectedUser.address],
                                ["Consent Checked", selectedUser.consent ? "Yes" : "No"],
                              ].map(([label, value]) => (
                                <div key={label} className="ww-row-hover flex justify-between items-center py-1.5 px-2 -mx-2 rounded-lg hover:bg-white/40">
                                  <span className="text-zinc-400 shrink-0">{label}</span>
                                  <span className="text-zinc-800 font-bold text-right break-all truncate max-w-[170px]" title={value}>{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {selectedUser.spouseName || selectedUser.childrenCount > 0 ? (
                          <div className="ww-glass ww-card-in rounded-[22px] p-5 space-y-4" style={{ animationDelay: "140ms" }}>
                            <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 pb-2.5 ww-heading">
                              <Heart className="w-4 h-4" /> Family & Dependents
                            </h4>

                            {selectedUser.spouseName && (
                              <div className="ww-lift ww-chip p-3 rounded-2xl border-l-[3px] border-l-rose-300 flex flex-col gap-1 text-xs">
                                <div className="flex justify-between">
                                  <div>
                                    <span className="text-[10px] font-bold text-zinc-400 block">SPOUSE</span>
                                    <span className="font-bold text-zinc-800">{selectedUser.spouseName} ({selectedUser.spouseAge})</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-[10px] font-bold text-zinc-400 block">OCCUPATION</span>
                                    <span className="font-semibold text-zinc-500">{selectedUser.spouseOccupation || "N/A"} {selectedUser.spouseDesignation && `@ ${selectedUser.spouseDesignation}`}</span>
                                  </div>
                                </div>
                                {selectedUser.spouseCompanyName && (
                                  <div className="flex justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-200/60">
                                    <span>Company</span>
                                    <span className="font-bold text-zinc-700">{selectedUser.spouseCompanyName}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {selectedUser.childrenCount > 0 && (
                              <div className="space-y-2">
                                <span className="text-[10px] font-bold text-zinc-400 block uppercase">Children ({selectedUser.childrenCount})</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {selectedUser.children.map((child, idx) => (
                                    <div key={idx} className="ww-lift ww-chip p-3 rounded-2xl border-l-[3px] border-l-[#2B7FFF]/50 text-xs flex flex-col gap-1.5">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <span className="font-bold text-zinc-800">{child.name}</span>
                                          <span className="block text-[10px] text-zinc-400">DOB: {child.dob}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                          <span className="bg-[#2B7FFF]/10 text-[#2B7FFF] font-semibold px-2 py-0.5 rounded-md text-[10px]">{child.age}</span>
                                          <span className="text-[9px] font-bold text-zinc-400 uppercase">{child.dependent ? "Dependent" : "Independent"}</span>
                                        </div>
                                      </div>
                                      {child.occupation && (
                                        <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/60 flex justify-between">
                                          <span>Occupation</span>
                                          <span className="font-bold text-zinc-700">{child.occupation}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="ww-glass ww-card-in rounded-[22px] p-5 text-center text-xs text-zinc-400" style={{ animationDelay: "140ms" }}>
                            No family or dependent information registered.
                          </div>
                        )}
                      </div>
                    )}

                    {/* ---------------- FINANCIALS TAB ---------------- */}
                    {activeTab === "financials" && (
                      selectedUser.calculation ? (
                        <div className="space-y-4">
                          {selectedUser.calculation.rates && (
                            <div className="ww-glass-tint rounded-2xl p-3 text-[11px] font-semibold text-zinc-600 flex flex-wrap items-center justify-between gap-2 ww-card-in">
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF]" />
                                <span>Pre-Retire:</span>
                                <span className="text-zinc-700 font-bold ww-figure">ROI {(selectedUser.calculation.rates.roi_pre * 100).toFixed(1)}% · Infl {(selectedUser.calculation.rates.inflation_pre * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex items-center gap-1 border-l border-zinc-300/60 pl-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Post-Retire:</span>
                                <span className="text-zinc-700 font-bold ww-figure">ROI {(selectedUser.calculation.rates.roi_post * 100).toFixed(1)}% · Infl {(selectedUser.calculation.rates.inflation_post * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          )}

                          {/* Bento stat cards — deeper, saturated gradients with an
                          inner glass sheen so they read as neumorphic widgets
                          rather than flat pastel tiles. */}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: "Retirement Corpus Required", value: selectedUser.calculation.summary?.total_retirement_corpus_required || selectedUser.calculation.summary?.corpus || selectedUser.calculation.client?.total_required_corpus, from: "#BFDBFE", via: "#DBEAFE", to: "#EFF6FF", text: "text-blue-700", dot: "bg-blue-500" },
                              { label: "Monthly Investment Target", value: selectedUser.calculation.summary?.monthly_investment_required || selectedUser.calculation.summary?.monthly_sip || selectedUser.calculation.client?.monthly_sip_required, from: "#A7F3D0", via: "#D1FAE5", to: "#ECFDF5", text: "text-emerald-700", dot: "bg-emerald-500" },
                              { label: "Goals Monthly SIP", value: selectedUser.calculation.summary?.total_goals_monthly_sip || selectedUser.calculation.goals?.total_monthly_sip, from: "#DDD6FE", via: "#EDE9FE", to: "#F5F3FF", text: "text-purple-700", dot: "bg-purple-500" },
                              { label: "Life Insurance Cover", value: selectedUser.calculation.summary?.average_insurance_required || selectedUser.calculation.insurance?.total_required, from: "#FDE68A", via: "#FEF3C7", to: "#FFFBEB", text: "text-amber-700", dot: "bg-amber-500" },
                            ].map((stat, i) => (
                              <div
                                key={stat.label}
                                className="ww-lift ww-card-in relative overflow-hidden rounded-2xl p-3.5 border border-white/60"
                                style={{
                                  background: `linear-gradient(160deg, ${stat.from}, ${stat.via} 55%, ${stat.to})`,
                                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -10px 16px -12px rgba(15,23,42,0.10), 0 14px 28px -18px rgba(15,23,42,0.28)",
                                  animationDelay: `${i * 50}ms`,
                                }}
                              >
                                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 15% 0%, rgba(255,255,255,0.55), transparent 55%)" }} />
                                <span className="relative flex items-center gap-1.5 text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                  <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} shrink-0`} />
                                  {stat.label}
                                </span>
                                <span className={`relative text-[15px] font-extrabold ${stat.text} mt-1.5 block ww-figure`}>
                                  {getDisplayVal(stat.value)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Corpus coverage rings — client & spouse */}
                          <FillOnMount>
                            {(ready) => {
                              const clientCov = getCoverage(selectedUser.calculation.client);
                              const spouseCov = selectedUser.calculation.spouse?.age ? getCoverage(selectedUser.calculation.spouse) : null;
                              if (!clientCov && !spouseCov) return null;
                              return (
                                <div className="ww-glass ww-card-in rounded-[22px] p-5 space-y-1" style={{ animationDelay: "160ms" }}>
                                  <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 pb-2.5 mb-3 ww-heading">
                                    <TrendingUp className="w-4 h-4" /> Corpus Coverage
                                  </h4>
                                  <div className="flex items-center justify-around gap-4 flex-wrap">
                                    {clientCov && (
                                      <div className="flex flex-col items-center gap-2">
                                        <RadialGauge pct={clientCov.pct} ready={ready} gradId="ww-grad-client" colorFrom="#34D399" colorTo="#059669" trackColor="#FEE2E2" centerLabel="Funded" />
                                        <span className="text-[11px] font-bold text-zinc-600 ww-heading">{selectedUser.calculation.client.name || selectedUser.name || "Client"}</span>
                                      </div>
                                    )}
                                    {spouseCov && (
                                      <div className="flex flex-col items-center gap-2">
                                        <RadialGauge pct={spouseCov.pct} ready={ready} gradId="ww-grad-spouse" colorFrom="#60A5FA" colorTo="#2563EB" trackColor="#FEE2E2" centerLabel="Funded" />
                                        <span className="text-[11px] font-bold text-zinc-600 ww-heading">{selectedUser.calculation.spouse.name || "Spouse"}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }}
                          </FillOnMount>

                          {/* Client projection detail (collapsible) */}
                          {selectedUser.calculation.client && (
                            <details className="ww-glass ww-card-in rounded-[22px] overflow-hidden group" style={{ animationDelay: "200ms" }} open>
                              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-6 rounded-full bg-[#2B7FFF]" />
                                  <div>
                                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide ww-heading block">
                                      {selectedUser.calculation.client.name || "Client"}'s Projections
                                    </span>
                                    <span className="text-[10px] text-zinc-400 ww-figure">
                                      Age {selectedUser.calculation.client.age || selectedUser.age} → {selectedUser.calculation.client.retirement_age || selectedUser.targetRetireAge || 60} ({selectedUser.calculation.client.years_to_retirement || "N/A"} yrs)
                                    </span>
                                  </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="px-5 pb-5 grid grid-cols-2 gap-3 text-xs font-medium">
                                <div className="flex justify-between border-b border-zinc-200/60 pb-2"><span className="text-zinc-400">Monthly Expense</span><span className="text-zinc-800 font-bold ww-figure">{getDisplayVal(selectedUser.calculation.client.monthly_expense_today)}</span></div>
                                <div className="flex justify-between border-b border-zinc-200/60 pb-2"><span className="text-zinc-400">Inflation Adj. Expense</span><span className="text-zinc-800 font-bold ww-figure">{getDisplayVal(selectedUser.calculation.client.inflation_adjusted_expense)}</span></div>
                                <div className="flex justify-between border-b border-zinc-200/60 pb-2"><span className="text-zinc-400">Required Corpus</span><span className="text-zinc-800 font-bold ww-figure">{getDisplayVal(selectedUser.calculation.client.total_required_corpus)}</span></div>
                                <div className="flex justify-between border-b border-zinc-200/60 pb-2"><span className="text-zinc-400">Projected PF Corpus</span><span className="text-emerald-600 font-bold ww-figure">+{getDisplayVal(selectedUser.calculation.client.projected_pf_corpus)}</span></div>
                                <div className="flex justify-between col-span-2 pb-1"><span className="text-zinc-500 font-semibold">Corpus Deficit Gap</span><span className="text-rose-500 font-extrabold ww-figure">{getDisplayVal(selectedUser.calculation.client.corpus_deficit_gap)}</span></div>
                                <div className="flex justify-between col-span-2 items-center ww-chip p-3 rounded-2xl mt-1">
                                  <div>
                                    <span className="text-[#2B7FFF] font-bold block text-xs">Recommended Monthly SIP</span>
                                    <span className="text-[10px] text-zinc-400">Over {selectedUser.calculation.client.years_to_retirement || 24} yrs</span>
                                  </div>
                                  <span className="text-sm font-extrabold text-[#2B7FFF] ww-figure">{getDisplayVal(selectedUser.calculation.client.monthly_sip_required)} /mo</span>
                                </div>
                                {selectedUser.calculation.client.lump_sum_alternative && (
                                  <div className="flex justify-between col-span-2 pt-1 text-[11px] text-zinc-400 italic">
                                    <span>Lump-Sum Alternative Today</span>
                                    <span className="font-bold text-zinc-600 ww-figure not-italic">{getDisplayVal(selectedUser.calculation.client.lump_sum_alternative)}</span>
                                  </div>
                                )}
                              </div>
                            </details>
                          )}

                          {/* Spouse projection detail (collapsible) */}
                          {selectedUser.calculation.spouse && selectedUser.calculation.spouse.age && (
                            <details className="ww-glass ww-card-in rounded-[22px] overflow-hidden group" style={{ animationDelay: "240ms" }}>
                              <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-6 rounded-full bg-emerald-500" />
                                  <div>
                                    <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide ww-heading block">
                                      {selectedUser.calculation.spouse.name || "Spouse"}'s Projections
                                    </span>
                                    <span className="text-[10px] text-zinc-400 ww-figure">
                                      Age {selectedUser.calculation.spouse.age} → {selectedUser.calculation.spouse.retirement_age || 55} ({selectedUser.calculation.spouse.years_to_retirement || "N/A"} yrs)
                                    </span>
                                  </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-zinc-400 transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="px-5 pb-5 grid grid-cols-2 gap-3 text-xs font-medium">
                                <div className="flex justify-between border-b border-zinc-200/60 pb-2"><span className="text-zinc-400">Monthly Expense</span><span className="text-zinc-800 font-bold ww-figure">{getDisplayVal(selectedUser.calculation.spouse.monthly_expense_today)}</span></div>
                                <div className="flex justify-between border-b border-zinc-200/60 pb-2"><span className="text-zinc-400">Inflation Adj. Expense</span><span className="text-zinc-800 font-bold ww-figure">{getDisplayVal(selectedUser.calculation.spouse.inflation_adjusted_expense)}</span></div>
                                <div className="flex justify-between border-b border-zinc-200/60 pb-2"><span className="text-zinc-400">Required Corpus</span><span className="text-zinc-800 font-bold ww-figure">{getDisplayVal(selectedUser.calculation.spouse.total_required_corpus)}</span></div>
                                <div className="flex justify-between border-b border-zinc-200/60 pb-2"><span className="text-zinc-400">Projected PF Corpus</span><span className="text-emerald-600 font-bold ww-figure">+{getDisplayVal(selectedUser.calculation.spouse.projected_pf_corpus)}</span></div>
                                <div className="flex justify-between col-span-2 pb-1"><span className="text-zinc-500 font-semibold">Corpus Deficit Gap</span><span className="text-rose-500 font-extrabold ww-figure">{getDisplayVal(selectedUser.calculation.spouse.corpus_deficit_gap)}</span></div>
                                <div className="flex justify-between col-span-2 items-center bg-emerald-500/10 ww-chip p-3 rounded-2xl mt-1">
                                  <div>
                                    <span className="text-emerald-700 font-bold block text-xs">Recommended Monthly SIP</span>
                                    <span className="text-[10px] text-zinc-400">Over {selectedUser.calculation.spouse.years_to_retirement || 24} yrs</span>
                                  </div>
                                  <span className="text-sm font-extrabold text-emerald-700 ww-figure">{getDisplayVal(selectedUser.calculation.spouse.monthly_sip_required)} /mo</span>
                                </div>
                                {selectedUser.calculation.spouse.lump_sum_alternative && (
                                  <div className="flex justify-between col-span-2 pt-1 text-[11px] text-zinc-400 italic">
                                    <span>Lump-Sum Alternative Today</span>
                                    <span className="font-bold text-zinc-600 ww-figure not-italic">{getDisplayVal(selectedUser.calculation.spouse.lump_sum_alternative)}</span>
                                  </div>
                                )}
                              </div>
                            </details>
                          )}

                          {/* Goals with inflation-impact mini charts */}
                          {selectedUser.goals && selectedUser.goals.length > 0 && (
                            <div className="ww-glass ww-card-in rounded-[22px] p-5 space-y-3" style={{ animationDelay: "280ms" }}>
                              <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 pb-2.5 ww-heading">
                                <Award className="w-4 h-4" /> Financial Goals
                              </h4>
                              <FillOnMount>
                                {(ready) => (
                                  <div className="space-y-3">
                                    {selectedUser.goals.map((goal) => (
                                      <div key={goal.id} className="ww-lift ww-chip p-3.5 rounded-2xl border-l-[3px] border-l-purple-300 text-xs space-y-2.5">
                                        <div className="flex justify-between font-bold text-zinc-800">
                                          <span className="text-purple-700">{goal.type} ({goal.targetYear})</span>
                                          <span className="ww-figure">{goal.monthlySip} /mo</span>
                                        </div>
                                        <InflationBar today={goal.todaysCostRaw} future={goal.futureCostRaw} ready={ready} />
                                        <div className="flex justify-between text-[10px] text-zinc-500 font-semibold">
                                          <span>Today: <span className="ww-figure text-zinc-700">{goal.todaysCost}</span></span>
                                          <span>Future: <span className="ww-figure text-zinc-700">{goal.futureCost}</span></span>
                                          <span>Inflation: <span className="ww-figure text-zinc-700">{goal.inflationRate}</span></span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </FillOnMount>
                            </div>
                          )}

                          {selectedUser.calculation.insurance && (
                            <div className="ww-glass-tint rounded-2xl p-3.5 text-[11px] text-zinc-500 flex items-start gap-1.5 ww-card-in" style={{ animationDelay: "320ms" }}>
                              <span className="text-amber-500 font-bold shrink-0">ⓘ</span>
                              <span>{selectedUser.calculation.insurance.note || "Insurance calculation covers client & spouse protection requirements."} Recommended cover: <strong className="text-zinc-700 ww-figure">{getDisplayVal(selectedUser.calculation.insurance.total_required)}</strong></span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="ww-glass ww-card-in rounded-[22px] p-8 text-center text-xs text-zinc-400">
                          <Award className="w-6 h-6 mx-auto mb-2 text-zinc-300" />
                          Retirement calculations have not been run for this assessment.
                        </div>
                      )
                    )}

                    {/* ---------------- REPORTS TAB ---------------- */}
                    {activeTab === "reports" && (
                      selectedUser.reports && selectedUser.reports.length > 0 ? (
                        <div className="ww-glass ww-card-in rounded-[22px] p-5 space-y-3">
                          <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 pb-2.5 ww-heading">
                            <FileText className="w-4 h-4" /> Generated Reports ({selectedUser.reports.length})
                          </h4>
                          {selectedUser.reports.map((report, idx) => (
                            <div key={idx} className="ww-lift ww-chip p-3.5 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-zinc-700 truncate block" title={report.file_name || "report.pdf"}>
                                    {report.file_name || `report-${report.report_id || report.id || idx}.pdf`}
                                  </span>
                                  {report.triggered_by && (
                                    <span className="bg-zinc-200/70 text-zinc-500 font-bold px-1.5 py-0.5 rounded text-[8px] uppercase select-none">{report.triggered_by}</span>
                                  )}
                                </div>
                                <span className="text-[10px] text-zinc-400 font-semibold block ww-figure">
                                  {report.generated_at ? parseUtcDate(report.generated_at).toLocaleString("en-IN") : "N/A"}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => downloadReportFile(report.report_id || report.id)}
                                disabled={downloadingReportId === (report.report_id || report.id)}
                                className="px-2.5 py-1.5 bg-[#2B7FFF]/10 border border-[#2B7FFF]/20 hover:bg-[#2B7FFF]/20 rounded-lg text-[10px] font-bold text-[#2B7FFF] cursor-pointer transition-all flex items-center gap-1 shrink-0"
                              >
                                {downloadingReportId === (report.report_id || report.id) ? <Loader2 className="w-3 animate-spin" /> : <Download className="w-3 h-3" />}
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="ww-glass ww-card-in rounded-[22px] p-8 text-center text-xs text-zinc-400">
                          <FileText className="w-6 h-6 mx-auto mb-2 text-zinc-300" />
                          No reports have been generated for this assessment yet.
                        </div>
                      )
                    )}

                    {/* ---------------- ACTIVITY TAB ---------------- */}
                    {activeTab === "activity" && (
                      <div className="ww-glass ww-card-in rounded-[22px] p-5 space-y-4">
                        <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200/60 pb-2.5 ww-heading">
                          <Calendar className="w-4 h-4" /> Activity & Audit Changes
                        </h4>
                        <div className="space-y-4">
                          {selectedUser.activities.map((act, index) => (
                            <div key={index} className="flex gap-3 text-xs border-l-2 border-[#2B7FFF]/15 pl-4 relative">
                              <span className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-[#2B7FFF] ring-4 ring-[#2B7FFF]/10" />
                              <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-center font-bold text-zinc-800">
                                  <span>{act.type}</span>
                                  <span className="text-[10px] text-zinc-400 font-medium ww-figure">{act.date}</span>
                                </div>
                                <p className="text-zinc-500 font-medium">{act.summary}</p>
                                <span className="text-[10px] text-zinc-400 font-semibold">Modified by: {act.actor}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}