import React, { useState } from "react";
import { apiLogsMock } from "../../mock/logsMock";
import { Terminal, Shield, Eye, ShieldAlert, Key, ToggleLeft, ToggleRight, Search } from "lucide-react";
import { useToast } from "../../components/UI/Toast";

export default function ApiLogs() {
  const [logs, setLogs] = useState(apiLogsMock);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const filteredLogs = logs.filter(
    (log) =>
      log.apiKey.toLowerCase().includes(search.toLowerCase()) ||
      log.role.toLowerCase().includes(search.toLowerCase()) ||
      log.status.toLowerCase().includes(search.toLowerCase())
  );

  const toggleKeyStatus = (id, currentStatus) => {
    let nextStatus = "Active";
    if (currentStatus === "Active") nextStatus = "Revoked";
    else if (currentStatus === "Revoked") nextStatus = "Active";
    else return; // Don't modify expired keys

    setLogs((prev) =>
      prev.map((log) => (log.id === id ? { ...log, ...{ status: nextStatus } } : log))
    );

    showToast(`API Key credentials status updated to "${nextStatus}".`, "success");
  };

  return (
    <div className="ww-page">

      {/* Page Header */}
      <div className="ww-page-header">
        <div>
          <h2 className="ww-page-title">API & Access Logs</h2>
          <p className="ww-page-subtitle">Audit active authorization credentials and request volume histories.</p>
        </div>
      </div>

      {/* API Overview Info banner */}
      <div className="bg-[#2B7FFF]/5/20 border border-[#2B7FFF]/10/50 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-[#2B7FFF] shrink-0 border border-indigo-200">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-sm font-extrabold text-zinc-800 leading-none">Security Access Auditing</span>
            <span className="block text-[10px] text-zinc-400 font-semibold mt-1">
              Admin roles have authorization to create, configure, or revoke access key variables.
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            const newKey = {
              id: `log-${Date.now()}`,
              apiKey: `${Math.random().toString(36).substr(2, 12)}...${Math.random().toString(36).substr(2, 8)}`,
              role: "Standard User",
              status: "Active",
              lastUsed: "Never",
              requestsCount: 0,
              rateLimit: "1,000/min"
            };
            setLogs((prev) => [newKey, ...prev]);
            showToast("New API Key generated successfully.", "success");
          }}
          className="px-4 py-2 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
        >
          Generate New API Key
        </button>
      </div>

      <div className="space-y-4">
        {/* Controls search */}
        <div className="bg-white border border-zinc-200 p-4 rounded-xl flex md:items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by API key, role, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-xs text-zinc-700 outline-none w-full placeholder-slate-400"
            />
          </div>
        </div>

        {/* API Table */}
        <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-400 font-medium bg-zinc-50/50">
                  <th className="py-3 px-4">API Key Token</th>
                  <th className="py-3 px-4">Role Privileges</th>
                  <th className="py-3 px-4">Requests volume</th>
                  <th className="py-3 px-4">Rate Limits</th>
                  <th className="py-3 px-4">Last Connection</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-slate-750">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="py-4 px-4 font-mono text-[11px] text-zinc-500 font-bold">{log.apiKey}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        log.role === "Admin" ? "text-[#2B7FFF]" : "text-zinc-500"
                      }`}>
                        <Shield className="w-3.5 h-3.5" /> {log.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-zinc-700 font-bold">{log.requestsCount.toLocaleString()}</td>
                    <td className="py-4 px-4 text-zinc-400">{log.rateLimit}</td>
                    <td className="py-4 px-4 text-zinc-400">{log.lastUsed}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        log.status === "Active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : log.status === "Revoked"
                          ? "bg-rose-50 text-rose-600 border-rose-100"
                          : "bg-zinc-50 text-zinc-400 border-zinc-200"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {log.status !== "Expired" ? (
                        <button
                          onClick={() => toggleKeyStatus(log.id, log.status)}
                          className="px-2.5 py-1 hover:bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold text-zinc-600 hover:text-[#2B7FFF] transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          {log.status === "Active" ? (
                            <>
                              <ToggleLeft className="w-4 h-4 text-rose-500" /> Revoke
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-500" /> Activate
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-zinc-400 italic">No Actions</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
