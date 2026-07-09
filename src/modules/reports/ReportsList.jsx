import React, { useState, useEffect } from "react";
import { FileText, Download, Search, CheckCircle, Loader2 } from "lucide-react";
import { getAdminReports, downloadAdminReportWithFilename } from "../../services/reportService";

const parseUtcDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  let s = dateStr.trim();
  if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s = s.replace(" ", "T") + "Z";
  }
  return new Date(s);
};

export default function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [search, setSearch] = useState("");
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const parseReportRecord = (rec) => {
    const rawDate = rec.created_at || rec.generated_at;
    return {
      id: rec.report_id || rec.id || "N/A",
      assessmentId: rec.assessment_id || "N/A",
      userName: rec.name || rec.userName || rec.client_name || "Client Audit",
      initials: (rec.name || rec.userName || "Client Audit").split(" ").map(n => n[0]).join(""),
      fileName: rec.file_name || rec.fileName || `report-${rec.assessment_id || rec.report_id}.pdf`,
      fileType: rec.format || rec.fileType || "pdf",
      generatedDate: rawDate ? parseUtcDate(rawDate).toLocaleString("en-IN") : "N/A",
      fileSize: rec.file_size || rec.fileSize || "2.4 MB"
    };
  };

  const loadReports = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log(`[ReportsList] Fetching all records...`);
      const params = { per_page: 1000 };
      const response = await getAdminReports(params);
      
      console.log("[ReportsList] API Response received:", response);
      
      let rawList = null;
      if (response) {
        const dataPayload = response.data || response;
        if (dataPayload) {
          rawList = dataPayload.items || (Array.isArray(dataPayload) ? dataPayload : null);
        }
      }

      if (Array.isArray(rawList)) {
        const parsedList = rawList.map((item) => parseReportRecord(item));
        console.log("[ReportsList] Parsed reports count:", parsedList.length);
        setReports(parsedList);
      } else {
        console.warn("[ReportsList] Could not find items array in response. Setting reports to empty.");
        setReports([]);
      }
    } catch (err) {
      console.error("Failed to load admin reports:", err);
      setErrorMsg(err.message || "Failed to query reports log from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReports();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = async (reportId) => {
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
    } catch (error) {
      console.error("Failed to download admin report:", error);
      alert("Failed to download PDF report: " + error.message);
    } finally {
      setDownloadingReportId(null);
    }
  };

  const filteredReports = reports.filter(
    (rep) =>
      (rep.userName || "").toLowerCase().includes(search.toLowerCase()) ||
      (rep.fileName || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalItems = filteredReports.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedReports = filteredReports.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  console.log("[ReportsList] Render state:", {
    totalItems,
    totalPages,
    pageSize,
    currentPage,
    reportsCount: reports.length,
    filteredCount: filteredReports.length,
    paginatedCount: paginatedReports.length
  });

  return (
    <div className="ww-page">
      {/* Page Header */}
      <div className="ww-page-header">
        <div>
          <h2 className="ww-page-title">Reports Log</h2>
          <p className="ww-page-subtitle">Browse and audit generated client strategy files.</p>
        </div>
      </div>

      {/* Reports stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total reports */}
        <div className="ww-glow-card group p-4 flex items-center gap-4">
          <div className="ww-card-content w-10 h-10 rounded-lg bg-[#2B7FFF]/5 flex items-center justify-center border border-[#2B7FFF]/10 shrink-0 text-[#2B7FFF]">
            <FileText className="w-5 h-5" />
          </div>
          <div className="ww-card-content">
            <span className="text-[10px] font-semibold text-zinc-400 block uppercase">Total Reports</span>
            <span className="text-base font-semibold text-zinc-900 leading-none mt-1 inline-flex items-baseline gap-1.5">
              {loading ? "..." : reports.length}
            </span>
          </div>
        </div>

        {/* Last generated */}
        <div className="ww-glow-card group p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shrink-0 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="ww-card-content">
            <span className="text-[10px] font-semibold text-zinc-400 block uppercase">Last Activity</span>
            <span className="text-xs font-semibold text-zinc-900 block mt-1">
              {loading ? "..." : (reports.length > 0 ? reports[0].generatedDate : "No recent activity")}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="space-y-4">
        {/* Search */}
        <div className="ww-panel-padded flex md:items-center justify-between">
          <div className="flex items-center gap-2 ww-control w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search reports by user or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ww-input"
            />
          </div>
        </div>

        {/* Reports log table */}
        <div className="ww-panel">
          <div className="overflow-x-auto">
            <table className="ww-table">
              <thead>
                <tr className="ww-table-head">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Report File</th>
                  <th className="py-3 px-4">Generated Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin text-[#2B7FFF] mx-auto mb-2" />
                      <p className="font-semibold text-xs text-zinc-500">Querying reports log database...</p>
                    </td>
                  </tr>
                ) : errorMsg ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-rose-500">
                      <p className="font-bold text-sm">Failed to Load Reports</p>
                      <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>
                      <button
                        type="button"
                        onClick={loadReports}
                        className="mt-3 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Retry Query
                      </button>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-slate-400">
                      No reports match your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((rep, index) => (
                    <tr key={`${rep.id || rep.fileName}-${index}`} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-4 px-4 font-semibold text-zinc-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#2B7FFF]/5 border border-[#2B7FFF]/10 flex items-center justify-center text-[#2B7FFF] text-[10px] font-semibold shrink-0">
                            {rep.initials || "C"}
                          </div>
                          <span>{rep.userName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-zinc-500 font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span className="font-semibold text-zinc-700 hover:text-[#2B7FFF] transition-colors cursor-pointer">
                            {rep.fileName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-normal">({rep.fileSize})</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-zinc-400 font-medium">{rep.generatedDate}</td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDownload(rep.id)}
                          disabled={downloadingReportId === rep.id}
                          className="px-2.5 py-1 hover:bg-[#2B7FFF]/5 border border-zinc-200 disabled:bg-zinc-100 rounded-lg text-[10px] font-semibold text-[#2B7FFF] cursor-pointer transition-colors inline-flex items-center gap-1.5 disabled:cursor-not-allowed"
                        >
                          {downloadingReportId === rep.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Download className="w-3.5 h-3.5" />
                          )}
                          Download
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Footer */}
        {!loading && !errorMsg && totalItems > 0 && (
          <div className="border-t border-zinc-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/30">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-semibold outline-none cursor-pointer hover:border-slate-300 transition-colors"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>entries</span>
              <span className="w-1.5 h-1.5 bg-slate-200 rounded-full mx-1" />
              <span>
                Showing <span className="font-bold text-slate-800">{Math.min(totalItems, (currentPage - 1) * pageSize + 1)}</span> to{" "}
                <span className="font-bold text-slate-800">{Math.min(totalItems, currentPage * pageSize)}</span> of{" "}
                <span className="font-bold text-slate-800">{totalItems}</span> entries
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="text-slate-400 text-xs px-1">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === p
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
