import React, { useState, useEffect } from "react";
import { Settings, Save, Key, Shield, RefreshCw, Radio } from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import { API_BASE_URL, API_KEY, ADMIN_API_KEY } from "../../config/api";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("");
  const [userKey, setUserKey] = useState("");
  const [adminKey, setAdminKey] = useState("");
  
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Read from localStorage or fall back to system defaults
    setApiUrl(localStorage.getItem("WW_API_URL") || API_BASE_URL);
    setUserKey(localStorage.getItem("WW_API_KEY") || API_KEY);
    setAdminKey(localStorage.getItem("WW_ADMIN_API_KEY") || ADMIN_API_KEY);
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    
    // Save to local storage
    localStorage.setItem("WW_API_URL", apiUrl.trim());
    localStorage.setItem("WW_API_KEY", userKey.trim());
    localStorage.setItem("WW_ADMIN_API_KEY", adminKey.trim());

    setTimeout(() => {
      setSaving(false);
      showToast("System environment settings saved! Reloading API connections.", "success");
      
      // Prompt app reload to apply Axios key configurations
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }, 1200);
  };

  const handleReset = () => {
    localStorage.removeItem("WW_API_URL");
    localStorage.removeItem("WW_API_KEY");
    localStorage.removeItem("WW_ADMIN_API_KEY");
    
    setApiUrl(API_BASE_URL);
    setUserKey(API_KEY);
    setAdminKey(ADMIN_API_KEY);

    showToast("Environment variables reset to baseline configurations.", "info");
  };

  return (
    <div className="ww-page max-w-2xl">

      {/* Page Header */}
      <div className="ww-page-header">
        <div>
          <h2 className="ww-page-title">System Settings</h2>
          <p className="ww-page-subtitle">Configure network URLs, authorization keys, and browser cache overrides.</p>
        </div>
      </div>

      {/* Settings Card */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
        <div className="border-b border-zinc-100 pb-3 flex items-center gap-2 mb-5">
          <Settings className="w-4 h-4 text-[#2B7FFF]" />
          <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Network & Key Variables</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* API Base URL */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
              API Base Connection URL
            </label>
            <input
              type="text"
              required
              placeholder="e.g. http://localhost:8000/api/v1"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full text-xs font-mono font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-[9px] text-zinc-400 block mt-1">Target server endpoint query path.</span>
          </div>

          {/* User API Key */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Key className="w-3.5 h-3.5" /> User client API Key
            </label>
            <input
              type="password"
              required
              placeholder="Enter standard user token"
              value={userKey}
              onChange={(e) => setUserKey(e.target.value)}
              className="w-full text-xs font-mono text-slate-750 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-[9px] text-zinc-400 block mt-1">Authentication token representing a standard user role.</span>
          </div>

          {/* Admin API Key */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Administrator API Key
            </label>
            <input
              type="password"
              required
              placeholder="Enter admin privilege token"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full text-xs font-mono text-slate-750 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
            />
            <span className="text-[9px] text-zinc-400 block mt-1">Administrative key variables matching the "admin" database role. Required to run updates on rates.</span>
          </div>

          {/* Operations controls */}
          <div className="flex justify-between items-center pt-4 border-t border-zinc-100 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-250 hover:bg-zinc-50 rounded-xl text-zinc-600 text-xs font-bold transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 disabled:bg-[#2B7FFF]/50 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-md shadow-[#2B7FFF]/10"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving variables..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
