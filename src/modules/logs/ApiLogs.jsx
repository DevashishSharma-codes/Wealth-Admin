import { useState, useEffect, useCallback } from "react";
import { Shield, Key, ToggleLeft, ToggleRight, Search, Copy, Check } from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import AdminModal from "../../components/UI/AdminModal";
import { getApiKeys, generateApiKey, revokeApiKey, activateApiKey } from "../../services/apiKeysService";

export default function ApiLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  // Create Key modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newKeyClientName, setNewKeyClientName] = useState("");
  const [newKeyRole, setNewKeyRole] = useState("user");
  const [generatedKey, setGeneratedKey] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchKeys = useCallback(async (query = "") => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApiKeys(query);

      const payload = data?.data || data;
      let itemsList = [];
      if (Array.isArray(payload)) {
        itemsList = payload;
      } else if (payload && Array.isArray(payload.items)) {
        itemsList = payload.items;
      } else if (payload && Array.isArray(payload.keys)) {
        itemsList = payload.keys;
      } else if (data && Array.isArray(data.items)) {
        itemsList = data.items;
      } else if (data && typeof data === "object") {
        if (data.data && Array.isArray(data.data.items)) {
          itemsList = data.data.items;
        } else {
          const flatValues = Object.values(data);
          const foundArr = flatValues.find(Array.isArray);
          if (foundArr) {
            itemsList = foundArr;
          } else {
            for (const val of flatValues) {
              if (val && typeof val === "object") {
                const innerArr = Object.values(val).find(Array.isArray);
                if (innerArr) {
                  itemsList = innerArr;
                  break;
                }
              }
            }
          }
        }
      }
      setLogs(itemsList);
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Failed to load API keys.";
      setError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  // Debounced search fetching
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchKeys(search);
    }, 300);

    return () => clearTimeout(handler);
  }, [search, fetchKeys]);

  const toggleKeyStatus = async (id, currentStatus) => {
    try {
      if (currentStatus === "Active") {
        await revokeApiKey(id);
        showToast("API Key status updated to Revoked.", "success");
      } else if (currentStatus === "Revoked") {
        await activateApiKey(id);
        showToast("API Key status updated to Active.", "success");
      } else {
        return; // Don't modify expired keys
      }
      fetchKeys(search);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to update API Key status.";
      showToast(errMsg, "error");
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyClientName.trim()) return;

    try {
      setGenerating(true);
      const res = await generateApiKey({
        client_name: newKeyClientName.trim(),
        role: newKeyRole,
      });

      const keyPayload = res?.data || res;
      if (keyPayload && keyPayload.api_key_plaintext) {
        setGeneratedKey(keyPayload.api_key_plaintext);
        showToast("New API Key generated successfully.", "success");
      } else {
        throw new Error("API key plaintext was not returned by server.");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to generate API Key.";
      showToast(errMsg, "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    showToast("API Key copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatLastConnection = (val) => {
    if (!val) return "Never";
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) return val;
      return date.toLocaleString();
    } catch {
      return val;
    }
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
            setGeneratedKey(null);
            setNewKeyClientName("");
            setNewKeyRole("user");
            setIsCreateOpen(true);
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
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Role Privileges</th>
                  <th className="py-3 px-4">Requests volume</th>
                  <th className="py-3 px-4">Rate Limits</th>
                  <th className="py-3 px-4">Last Connection</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-slate-750">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-zinc-400">
                      Loading API keys...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-rose-500 font-bold">
                      {error}
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-zinc-400">
                      No API keys found. Click "Generate New API Key" to create one.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="py-4 px-4 font-mono text-[11px] text-zinc-500 font-bold">
                        {log.api_key_token}
                      </td>
                      <td className="py-4 px-4 font-semibold text-zinc-700">
                        {log.client_name || "N/A"}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                            log.role_label === "Admin" ? "text-[#2B7FFF]" : "text-zinc-500"
                          }`}
                        >
                          <Shield className="w-3.5 h-3.5" /> {log.role_label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-zinc-700 font-bold">
                        {typeof log.request_count === "number" ? log.request_count.toLocaleString() : log.request_count}
                      </td>
                      <td className="py-4 px-4 text-zinc-400">{log.rate_limit}</td>
                      <td className="py-4 px-4 text-zinc-400">
                        {formatLastConnection(log.last_connection)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            log.status === "Active"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                              : log.status === "Revoked"
                              ? "bg-rose-50 text-rose-600 border-rose-100"
                              : "bg-zinc-50 text-zinc-400 border-zinc-200"
                          }`}
                        >
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Generate API Key Modal */}
      <AdminModal
        isOpen={isCreateOpen}
        onClose={() => {
          if (generatedKey) {
            // Force refresh on close if key was generated
            fetchKeys(search);
          }
          setIsCreateOpen(false);
        }}
        title="Generate New API Key"
      >
        {!generatedKey ? (
          <form onSubmit={handleGenerateKey} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Client Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Website Client, Mobile App"
                value={newKeyClientName}
                onChange={(e) => setNewKeyClientName(e.target.value)}
                className="w-full text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#2B7FFF]/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Role Privileges
              </label>
              <select
                value={newKeyRole}
                onChange={(e) => setNewKeyRole(e.target.value)}
                className="w-full text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#2B7FFF]/40 transition-colors"
              >
                <option value="user">Standard User (Max 1,000 req/min)</option>
                <option value="admin">Admin (Unlimited requests)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={generating || !newKeyClientName.trim()}
                className="px-5 py-2.5 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 disabled:bg-zinc-350 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed transition-all shadow-md shadow-[#2B7FFF]/10"
              >
                {generating ? "Generating..." : "Generate Key"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-medium space-y-1">
              <span className="block font-bold text-amber-900">⚠️ Important Security Warning</span>
              <span className="block">
                Make sure to copy your API key now. You will not be able to see this plaintext token again. Store it securely.
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                Generated API Key
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedKey}
                  className="w-full text-xs font-mono font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setGeneratedKey(null);
                  setNewKeyClientName("");
                  setNewKeyRole("user");
                  fetchKeys(search);
                }}
                className="px-5 py-2 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
