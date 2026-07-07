import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Filter, X, Eye, Calendar, Award, CheckCircle, HelpCircle, Briefcase, Heart, User, MapPin, Download, Loader2, FileSpreadsheet } from "lucide-react";
import { 
  getAdminUsers, 
  getAdminLeads, 
  getAdminAssessments,
  exportAdminAssessment,
  exportAdminUsers,
  exportAdminAssessments
} from "../../services/assessmentService";
import { downloadAdminReport } from "../../services/reportService";
import { useToast } from "../../components/UI/Toast";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // All, Leads, Completed
  const [showFreeLeadsOnly, setShowFreeLeadsOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [downloadingReportId, setDownloadingReportId] = useState(null);
  const [downloadingExcelId, setDownloadingExcelId] = useState(null);
  const [exportingUsers, setExportingUsers] = useState(false);
  const [exportingAssessments, setExportingAssessments] = useState(false);
  const { showToast } = useToast();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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
      createdDate: rec.created_at ? new Date(rec.created_at).toLocaleDateString("en-IN") : "N/A",
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
          date: rec.created_at ? new Date(rec.created_at).toLocaleDateString() : "Just now",
          summary: "Assessment intake record initiated via client application.",
          actor: "Client Portal"
        }
      ]
    };
  };

  const loadAssessments = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log(`[UsersList] Fetching all records for statusFilter: ${statusFilter}...`);
      let response;
      const params = { per_page: 1000 };
      
      if (statusFilter === "All") {
        response = await getAdminUsers(params);
      } else if (statusFilter === "Leads") {
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
        console.log("[UsersList] Completed parsing assessments list. Count:", parsedList.length);
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
  };

  useEffect(() => {
    setCurrentPage(1);
    loadAssessments();
  }, [statusFilter]);

  const downloadReportFile = async (reportId, assessmentId) => {
    if (!reportId) return;
    setDownloadingReportId(reportId);
    try {
      const response = await downloadAdminReport(reportId);
      const url = URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `report-${assessmentId || reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Failed to download admin report:", error);
      alert("Failed to download PDF report: " + error.message);
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

  console.log("[UsersList] Render state:", {
    totalItems,
    totalPages,
    pageSize,
    currentPage,
    usersCount: users.length,
    filteredCount: filteredUsers.length,
    paginatedCount: paginatedUsers.length
  });

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
            onChange={(e) => setSearch(e.target.value)}
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
                  setStatusFilter(tab);
                  if (tab !== "Leads") setShowFreeLeadsOnly(false);
                }}
                className={`px-4 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  statusFilter === tab
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
                    onClick={() => setSelectedUser(user)}
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
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        user.status === "Completed"
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
                          onClick={() => setSelectedUser(user)}
                          className="px-2.5 py-1 hover:bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold text-[#2B7FFF] hover:text-[#2B7FFF]/80 cursor-pointer transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Details
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
                            onClick={() => downloadReportFile(user.reportId, user.id)}
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
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === p
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

      {/* Sliding Detail Drawer Panel */}
      {selectedUser && createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay backdrop */}
          <div
            onClick={() => setSelectedUser(null)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Sliding Panel Body */}
          <div className="relative w-full max-w-xl md:max-w-2xl bg-zinc-50 h-full shadow-2xl flex flex-col z-10 animate-slide-in border-l border-zinc-200">
            {/* Header */}
            <div className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  Assessments / Detail View
                </span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                <span className="text-xs font-bold text-zinc-500">ID: {selectedUser.id}</span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable details wrapper */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* User overview badge */}
              <div className="bg-white border border-zinc-200/60 p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2B7FFF]/5 border border-[#2B7FFF]/10 flex items-center justify-center text-[#2B7FFF] font-extrabold text-lg shrink-0">
                    {selectedUser.name ? selectedUser.name.split(" ").map((n) => n[0]).join("") : "U"}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-zinc-800 leading-none">
                      {selectedUser.name}
                    </h3>
                    <span className="inline-block mt-1 text-xs text-zinc-400 font-medium">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                    selectedUser.status === "Completed"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    {selectedUser.status}
                  </span>
                  <button
                    type="button"
                    onClick={() => downloadAssessmentExcel(selectedUser.id)}
                    disabled={downloadingExcelId === selectedUser.id}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs shrink-0 disabled:cursor-not-allowed"
                    title="Export to Excel"
                  >
                    {downloadingExcelId === selectedUser.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    )}
                    Excel
                  </button>
                  {selectedUser.reportId && (
                    <button
                      type="button"
                      onClick={() => downloadReportFile(selectedUser.reportId, selectedUser.id)}
                      disabled={downloadingReportId === selectedUser.reportId}
                      className="px-3 py-1.5 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors disabled:bg-zinc-200 disabled:cursor-not-allowed shadow-xs shrink-0"
                    >
                      {downloadingReportId === selectedUser.reportId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      PDF
                    </button>
                  )}
                </div>
              </div>

              {/* Personal Details Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-zinc-200/60 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                    <User className="w-4 h-4" /> Personal Details
                  </h4>
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex justify-between"><span className="text-zinc-400">Occupation</span><span className="text-zinc-800 font-bold">{selectedUser.role}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Date of Birth</span><span className="text-zinc-800 font-bold">{selectedUser.dob} ({selectedUser.age})</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Marital Status</span><span className="text-zinc-800 font-bold">{selectedUser.maritalStatus}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Retirement Age</span><span className="text-zinc-800 font-bold">{selectedUser.targetRetireAge}</span></div>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200/60 p-4 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                    <Briefcase className="w-4 h-4" /> Contact Channels
                  </h4>
                  <div className="space-y-2 text-xs font-medium">
                    <div className="flex justify-between"><span className="text-zinc-400">Email Address</span><span className="text-zinc-800 font-bold break-all text-right">{selectedUser.email}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Primary Phone</span><span className="text-zinc-800 font-bold">{selectedUser.phone}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Mailing Address</span><span className="text-zinc-800 font-bold text-right truncate max-w-[200px]" title={selectedUser.address}>{selectedUser.address}</span></div>
                    <div className="flex justify-between"><span className="text-zinc-400">Consent Checked</span><span className="text-zinc-800 font-bold">{selectedUser.consent ? "Yes" : "No"}</span></div>
                  </div>
                </div>
              </div>

              {/* Family & Children Details Card */}
              {selectedUser.spouseName || selectedUser.childrenCount > 0 ? (
                <div className="bg-white border border-zinc-200/60 p-5 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                    <Heart className="w-4 h-4" /> Family & Dependents
                  </h4>
                  
                  {selectedUser.spouseName && (
                    <div className="bg-zinc-50/50 p-3 rounded-lg border border-zinc-200 flex justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 block">SPOUSE</span>
                        <span className="font-bold text-zinc-800">{selectedUser.spouseName} ({selectedUser.spouseAge})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-zinc-400 block">OCCUPATION</span>
                        <span className="font-semibold text-zinc-500">{selectedUser.spouseDesignation} @ {selectedUser.spouseCompanyName}</span>
                      </div>
                    </div>
                  )}

                  {selectedUser.childrenCount > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-zinc-400 block uppercase">Children ({selectedUser.childrenCount})</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedUser.children.map((child, idx) => (
                          <div key={idx} className="p-3 bg-zinc-50/50 rounded-lg border border-zinc-200 text-xs flex justify-between items-center">
                            <div>
                              <span className="font-bold text-zinc-800">{child.name}</span>
                              <span className="block text-[10px] text-zinc-400">DOB: {child.dob}</span>
                            </div>
                            <span className="bg-[#2B7FFF]/5 text-[#2B7FFF] font-semibold px-2 py-0.5 rounded-md text-[10px]">{child.age}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-zinc-200/60 p-5 rounded-xl text-center text-xs text-zinc-400">
                  No family or dependent information registered.
                </div>
              )}

              {/* Projections Corpus Metrics Card */}
              {selectedUser.status === "Completed" && (
                <div className="bg-white border border-zinc-200/60 p-5 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                    <Award className="w-4 h-4" /> Strategic Financial Projections
                  </h4>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-[#2B7FFF]/5 rounded-xl border border-[#2B7FFF]/10">
                      <span className="text-[9px] font-bold text-zinc-400 block uppercase">Recommended SIP</span>
                      <span className="text-base font-extrabold text-[#2B7FFF] block mt-1">{selectedUser.projections.sip}</span>
                      <span className="text-[9px] text-zinc-400 block mt-0.5">per month</span>
                    </div>
                    <div className="p-3 bg-[#2B7FFF]/5 rounded-xl border border-[#2B7FFF]/10">
                      <span className="text-[9px] font-bold text-zinc-400 block uppercase">Required Corpus</span>
                      <span className="text-base font-extrabold text-[#2B7FFF] block mt-1">{selectedUser.projections.corpus}</span>
                      <span className="text-[9px] text-zinc-400 block mt-0.5">at retirement</span>
                    </div>
                    <div className="p-3 bg-[#2B7FFF]/5 rounded-xl border border-[#2B7FFF]/10">
                      <span className="text-[9px] font-bold text-zinc-400 block uppercase">Insurance Gap</span>
                      <span className="text-base font-extrabold text-[#2B7FFF] block mt-1">{selectedUser.projections.insurance}</span>
                      <span className="text-[9px] text-zinc-400 block mt-0.5">Term/Life</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-zinc-400 block uppercase">Asset Allocation Strategy</span>
                    <div className="w-full flex h-3.5 rounded-full overflow-hidden border border-zinc-200">
                      <div className="bg-[#2B7FFF] h-full" style={{ width: `${selectedUser.projections.equity}%` }} title={`Equity: ${selectedUser.projections.equity}%`} />
                      <div className="bg-slate-400 h-full" style={{ width: `${selectedUser.projections.debt}%` }} title={`Debt: ${selectedUser.projections.debt}%`} />
                      <div className="bg-emerald-500 h-full" style={{ width: `${selectedUser.projections.commodities}%` }} title={`Commodities: ${selectedUser.projections.commodities}%`} />
                    </div>
                    <div className="flex gap-4 text-[10px] font-semibold text-zinc-500 justify-center">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#2B7FFF] rounded-full" /> Equity ({selectedUser.projections.equity}%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-400 rounded-full" /> Debt ({selectedUser.projections.debt}%)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Commodities ({selectedUser.projections.commodities}%)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Goals Card */}
              {selectedUser.goals && selectedUser.goals.length > 0 && (
                <div className="bg-white border border-zinc-200/60 p-5 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                    <Award className="w-4 h-4" /> Financial Goals Progress
                  </h4>

                  <div className="space-y-3">
                    {selectedUser.goals.map((goal) => (
                      <div key={goal.id} className="text-xs">
                        <div className="flex justify-between font-bold text-zinc-700 mb-1">
                          <span>{goal.type} ({goal.targetYear})</span>
                          <span>{goal.todaysCost} • {goal.progress}% Reached</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#2B7FFF] h-full rounded-full transition-all duration-300" style={{ width: `${goal.progress}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Log Activity Changes */}
              <div className="bg-white border border-zinc-200/60 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-2">
                  <Calendar className="w-4 h-4" /> Activity & Audit Changes
                </h4>

                <div className="space-y-4">
                  {selectedUser.activities.map((act, index) => (
                    <div key={index} className="flex gap-3 text-xs border-l-2 border-[#2B7FFF]/10 pl-4 relative">
                      <span className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-[#2B7FFF]" />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-center font-bold text-zinc-800">
                          <span>{act.type}</span>
                          <span className="text-[10px] text-zinc-400 font-medium">{act.date}</span>
                        </div>
                        <p className="text-zinc-500 font-medium">{act.summary}</p>
                        <span className="text-[10px] text-zinc-400 font-semibold">Modified by: {act.actor}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
