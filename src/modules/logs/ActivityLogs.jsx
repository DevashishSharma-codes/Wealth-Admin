import React, { useState, useEffect } from "react";
import { Search, Trash2, Calendar, User, Eye, ClipboardList, Shield, RefreshCw } from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import { getActivityLogs, clearActivityLogs } from "../../utils/activityLogger";
import { useAuth } from "../../context/AuthContext";

export default function ActivityLogs() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  
  const loadLogs = () => {
    const list = getActivityLogs();
    setLogs(list);
  };

  useEffect(() => {
    loadLogs();

    // Sync logs from other tabs in real-time
    const handleStorageChange = (e) => {
      if (e.key === "ADMIN_ACTIVITY_LOGS") {
        loadLogs();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleClearLogs = () => {
    if (window.confirm("Are you sure you want to clear all activity logs? This audit trail will be permanently deleted.")) {
      clearActivityLogs();
      loadLogs();
      showToast("Activity logs cleared successfully.", "success");
    }
  };

  const formatTimestamp = (isoString) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      // Return e.g. "10 Jul 2026, 11:50 AM"
      return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ", " + date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // Filter logs based on search and role
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase());
      
    const matchesRole = 
      selectedRole === "all" || 
      log.user.toLowerCase() === selectedRole.toLowerCase();

    return matchesSearch && matchesRole;
  });

  // Get unique roles from existing logs for filter dropdown
  const uniqueRoles = Array.from(new Set(logs.map((log) => log.user)));

  return (
    <div className="ww-page space-y-6">
      {/* Page Header */}
      <div className="ww-page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="ww-page-title">Activity Audit Logs</h2>
          <p className="ww-page-subtitle">Trace all administrative operations back to specific user actions.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadLogs}
            className="p-2.5 bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-xl hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer shadow-xs"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {/* Clear logs button, visible to Developers only */}
          {currentUser?.role === "Developer" && (
            <button
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold cursor-pointer hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Clear Logs
            </button>
          )}
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-[#2B7FFF]/5 border border-[#2B7FFF]/10 p-5 rounded-2xl flex items-start gap-3.5 max-w-6xl shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#2B7FFF]/10 border border-[#2B7FFF]/20 flex items-center justify-center text-[#2B7FFF] shrink-0">
          <ClipboardList className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">Frontend Administration Audit</h4>
          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mt-1">
            This trace history details user operations including managing services, setting testimonials, and file uploads. Logs are stored directly in your browser's persistent workspace memory.
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-zinc-200 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs max-w-6xl">
        <div className="flex items-center gap-2.5 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 w-full md:w-80 transition-colors focus-within:bg-white focus-within:border-[#2B7FFF]/45">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by action details, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-xs text-zinc-700 outline-none w-full placeholder-zinc-400 font-semibold"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
          <span className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider hidden sm:inline">Filter User:</span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs font-bold text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B7FFF]/45 focus:bg-white transition-all w-full sm:w-56 cursor-pointer"
          >
            <option value="all">All Authorized Users</option>
            {uniqueRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
            {/* Fallback to show all hardcoded users in selection list */}
            {!uniqueRoles.includes("Keshav Malpani") && <option value="Keshav Malpani">Keshav Malpani</option>}
            {!uniqueRoles.includes("Kailash Malpani") && <option value="Kailash Malpani">Kailash Malpani</option>}
            {!uniqueRoles.includes("Wealth Wisdom Team") && <option value="Wealth Wisdom Team">Wealth Wisdom Team</option>}
            {!uniqueRoles.includes("Developer") && <option value="Developer">Developer</option>}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-xs overflow-hidden max-w-6xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-400 font-bold bg-zinc-50/50 uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6 w-1/4">User Name / Role</th>
                <th className="py-4 px-6">Action Performed</th>
                <th className="py-4 px-6 w-1/4 text-right">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-medium text-zinc-650 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-zinc-400 font-bold">
                    {logs.length === 0 ? "No activity logs recorded yet." : "No logs match the current search filters."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isDeveloper = log.user === "Developer";
                  return (
                    <tr key={log.id} className="hover:bg-zinc-50/30 transition-all duration-150">
                      {/* User Column */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 select-none shadow-xs
                            ${isDeveloper ? "bg-[#2B7FFF]/10 text-[#2B7FFF] border border-blue-150" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}
                          `}>
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="block font-bold text-zinc-800 text-xs leading-tight">{log.user}</span>
                            <span className="block text-[9px] text-zinc-400 font-bold tracking-wider mt-0.5 font-mono uppercase">
                              {log.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Action Column */}
                      <td className="py-4.5 px-6 leading-relaxed font-semibold text-zinc-700">
                        {log.action}
                      </td>

                      {/* Timestamp Column */}
                      <td className="py-4.5 px-6 text-right text-zinc-400 font-semibold font-mono text-[11px]">
                        <div className="inline-flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {formatTimestamp(log.timestamp)}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
