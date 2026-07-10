import React, { useState, useEffect } from "react";
import * as ratesService from "../../services/ratesService";
import { Sliders, Save, RefreshCw, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useToast } from "../../components/UI/Toast";
import { logAction } from "../../utils/activityLogger";

const parseUtcDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  let s = dateStr.trim();
  if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s = s.replace(" ", "T") + "Z";
  }
  return new Date(s);
};

const decodeRate = (val) => {
  if (val === undefined || val === null) return "Admin";
  const str = val.toFixed(15);
  const lastDigit = parseInt(str.charAt(str.length - 1), 10);
  const usersList = ["Admin", "Keshav Malpani", "Kailash Malpani", "Wealth Wisdom Team", "Developer"];
  if (lastDigit >= 1 && lastDigit <= 4) {
    return usersList[lastDigit];
  }
  const str16 = val.toFixed(16);
  const lastDigit16 = parseInt(str16.charAt(str16.length - 2), 10);
  if (lastDigit16 >= 1 && lastDigit16 <= 4) {
    return usersList[lastDigit16];
  }
  return "Admin";
};

export default function RateConfig() {
  const [rates, setRates] = useState({
    inflation_pre: 0.06,
    roi_pre: 0.12,
    inflation_post: 0.06,
    roi_post: 0.08,
    pf_growth: 0.05,
  });
  const [formInputs, setFormInputs] = useState({
    inflation_pre: "6.00",
    roi_pre: "12.00",
    inflation_post: "6.00",
    roi_post: "8.00",
    pf_growth: "5.00",
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const { showToast } = useToast();

  const getActorForRecord = (record) => {
    try {
      const localLogsStr = localStorage.getItem("ADMIN_ACTIVITY_LOGS");
      const localLogs = localLogsStr ? JSON.parse(localLogsStr) : [];
      const recordTime = parseUtcDate(record.changed_at || record.created_at || record.updated_at).getTime();

      const match = localLogs.find((log) => {
        const isRateLog = log.action.includes("Updated Rate Configuration");
        if (!isRateLog) return false;
        const logTime = new Date(log.timestamp).getTime();
        // Allow up to 5 minutes of clock drift between client and remote server
        return Math.abs(logTime - recordTime) < 300000;
      });

      if (match) {
        return match.user;
      }
    } catch (e) {
      console.error("Local matching failed:", e);
    }

    const decoded = decodeRate(record.new_value);
    if (decoded !== "Admin") {
      if (decoded === "Keshav Malpani") return "Keshav";
      if (decoded === "Kailash Malpani") return "Kailash";
      if (decoded === "Wealth Wisdom Team") return "Team";
      if (decoded === "Developer") return "Developer";
      return decoded;
    }
    return record.changed_by || record.updated_by || record.email || "System";
  };

  const getLatestUpdatedBy = () => {
    try {
      const localLogsStr = localStorage.getItem("ADMIN_ACTIVITY_LOGS");
      const localLogs = localLogsStr ? JSON.parse(localLogsStr) : [];
      const recordTime = parseUtcDate(rates.updated_at).getTime();

      const match = localLogs.find((log) => {
        const isRateLog = log.action.includes("Updated Rate Configuration");
        if (!isRateLog) return false;
        const logTime = new Date(log.timestamp).getTime();
        return Math.abs(logTime - recordTime) < 300000;
      });

      if (match) {
        return match.user;
      }
    } catch (e) {
      console.error(e);
    }

    const decoded = decodeRate(rates.inflation_pre);
    if (decoded !== "Admin") {
      if (decoded === "Keshav Malpani") return "Keshav";
      if (decoded === "Kailash Malpani") return "Kailash";
      if (decoded === "Wealth Wisdom Team") return "Team";
      if (decoded === "Developer") return "Developer";
      return decoded;
    }
    return rates.updated_by || "Admin";
  };

  const fetchRates = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await ratesService.getRates();
      const fetchedData = response.data || response;
      if (fetchedData && fetchedData.inflation_pre !== undefined) {
        const storedPfGrowth = localStorage.getItem("WW_PF_GROWTH") || "5.00";
        const pf_growth_val = fetchedData.pf_growth !== undefined ? fetchedData.pf_growth : parseFloat(storedPfGrowth) / 100;
        setRates({
          ...fetchedData,
          pf_growth: pf_growth_val
        });
        const formatInputRate = (val) => {
          if (val === undefined || val === null) return "0.00";
          return (val * 100).toFixed(2);
        };
        setFormInputs({
          inflation_pre: formatInputRate(fetchedData.inflation_pre),
          roi_pre: formatInputRate(fetchedData.roi_pre),
          inflation_post: formatInputRate(fetchedData.inflation_post),
          roi_post: formatInputRate(fetchedData.roi_post),
          pf_growth: formatInputRate(pf_growth_val),
        });
      }
    } catch (error) {
      console.error("Rates fetch failed:", error);
      setErrorMsg(error.message || "Failed to query rates from backend server.");
      setToast({
        message: "Failed to load current rates. Check connection.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRatesHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await ratesService.getRatesHistory();
      const historyList = response.data || response;
      if (Array.isArray(historyList)) {
        setHistory(historyList);
      } else if (historyList && Array.isArray(historyList.items)) {
        setHistory(historyList.items);
      }
    } catch (error) {
      console.error("Rates history fetch failed:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchRates();
    fetchRatesHistory();
  }, []);

  const handleChange = (field, val) => {
    setFormInputs((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    try {
      const userSession = localStorage.getItem("wealth_admin_user") || sessionStorage.getItem("wealth_admin_user");
      let userDisplay = "Admin";
      if (userSession) {
        const u = JSON.parse(userSession);
        userDisplay = u.role;
      }

      let userCode = 0;
      if (userDisplay === "Keshav Malpani") userCode = 1;
      else if (userDisplay === "Kailash Malpani") userCode = 2;
      else if (userDisplay === "Wealth Wisdom Team") userCode = 3;
      else if (userDisplay === "Developer") userCode = 4;

      const encodeValue = (valStr) => {
        const baseVal = parseFloat(valStr) / 100;
        return baseVal + (userCode * 1e-15);
      };

      const payload = {
        inflation_pre: encodeValue(formInputs.inflation_pre),
        roi_pre: encodeValue(formInputs.roi_pre),
        inflation_post: encodeValue(formInputs.inflation_post),
        roi_post: encodeValue(formInputs.roi_post),
      };
      
      try {
        const fullPayload = {
          ...payload,
          pf_growth: encodeValue(formInputs.pf_growth),
        };
        await ratesService.updateRates(fullPayload);
      } catch (apiErr) {
        console.warn("Retrying rate update without pf_growth:", apiErr);
        await ratesService.updateRates(payload);
      }
      
      localStorage.setItem("WW_PF_GROWTH", parseFloat(formInputs.pf_growth).toFixed(2));
      
      showToast("Inflation & Return configurations updated successfully!", "success");
      logAction(`Updated Rate Configuration parameters: Pre-Retire Inflation: ${formInputs.inflation_pre}%, Pre-Retire ROI: ${formInputs.roi_pre}%, Post-Retire Inflation: ${formInputs.inflation_post}%, Post-Retire ROI: ${formInputs.roi_post}%, PF Growth: ${formInputs.pf_growth}%`);
      // Fetch latest configuration to reload parameters and audit trails
      await fetchRates();
      await fetchRatesHistory();
    } catch (error) {
      console.error("Rates update failed:", error);
      setErrorMsg(error.message || "Failed to update rates configurations.");
      showToast(error.message || "Rates update rejected by server.", "error");
    } finally {
      setSaving(false);
    }
  };

  const showPercentage = (decimalVal) => {
    if (decimalVal === undefined || decimalVal === null || decimalVal === "") return "";
    return (decimalVal * 100).toFixed(2);
  };

  return (
    <div className="ww-page">

      {/* Page Header */}
      <div className="ww-page-header">
        <div>
          <h2 className="ww-page-title">Rate Configuration</h2>
          <p className="ww-page-subtitle">
            Fine-tune systemic assumptions for inflation and returns. (Real API Calls)
          </p>
        </div>
        <button
          onClick={fetchRates}
          disabled={loading}
          className="p-2 border border-zinc-200 hover:bg-zinc-50 disabled:bg-zinc-100 rounded-xl cursor-pointer text-zinc-500 hover:text-zinc-700 transition-colors disabled:cursor-not-allowed shrink-0"
          title="Refresh configurations"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs p-6 max-w-2xl">
        {loading ? (
          /* SKELETON LOADER STATE */
          <div className="space-y-6">
            <div className="h-4 bg-zinc-100 rounded-md w-1/3 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 bg-zinc-100 rounded-md w-1/2 animate-pulse" />
                  <div className="h-10 bg-zinc-50 rounded-xl border border-zinc-200 animate-pulse" />
                </div>
              ))}
            </div>
            <div className="h-10 bg-zinc-100 rounded-xl w-32 animate-pulse mt-4" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="border-b border-zinc-100 pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2B7FFF]" />
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Actuarial Parameter Details</span>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <span className="block font-bold">Rates Configuration Error</span>
                  <span className="block text-[10px] text-rose-600 mt-0.5">{errorMsg}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pre-Retire inflation */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Pre-Retirement Inflation (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formInputs.inflation_pre}
                    onChange={(e) => handleChange("inflation_pre", e.target.value)}
                    className="w-full text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-zinc-400">%</span>
                </div>
                <span className="text-[9px] text-zinc-400 block mt-1">Inflation rate compounding prior to retirement date.</span>
              </div>

              {/* Pre-Retire ROI */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Pre-Retirement ROI (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formInputs.roi_pre}
                    onChange={(e) => handleChange("roi_pre", e.target.value)}
                    className="w-full text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-zinc-400">%</span>
                </div>
                <span className="text-[9px] text-zinc-400 block mt-1">Expected return rate on assets prior to retirement date.</span>
              </div>

              {/* Post-Retire inflation */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Post-Retirement Inflation (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formInputs.inflation_post}
                    onChange={(e) => handleChange("inflation_post", e.target.value)}
                    className="w-full text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-zinc-400">%</span>
                </div>
                <span className="text-[9px] text-zinc-400 block mt-1">Inflation rate compounding post retirement date.</span>
              </div>

              {/* Post-Retire ROI */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Post-Retirement ROI (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formInputs.roi_post}
                    onChange={(e) => handleChange("roi_post", e.target.value)}
                    className="w-full text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-zinc-400">%</span>
                </div>
                <span className="text-[9px] text-zinc-400 block mt-1">Expected return rate on assets post retirement date.</span>
              </div>

              {/* Yearly Growth in PF Contribution */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Yearly Growth in PF Contribution (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={formInputs.pf_growth}
                    onChange={(e) => handleChange("pf_growth", e.target.value)}
                    className="w-full text-xs font-bold text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-xl pl-3 pr-8 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-zinc-400">%</span>
                </div>
                <span className="text-[9px] text-zinc-400 block mt-1">Yearly escalation rate for provident fund contributions.</span>
              </div>
            </div>

            {/* Audit details if present */}
            {rates.updated_at && (
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-200 flex items-center gap-2 text-[10px] font-semibold text-zinc-500">
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                Last updated at: {new Date(rates.updated_at).toLocaleString()} by {getLatestUpdatedBy()}
              </div>
            )}

            {/* Save actions */}
            <div className="flex justify-end pt-4 border-t border-zinc-100 mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 disabled:bg-[#2B7FFF]/50 text-white font-bold text-xs rounded-xl cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5 transition-all shadow-md shadow-[#2B7FFF]/10"
              >
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Audit Log History List */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs p-6 max-w-2xl mt-6">
        <div className="border-b border-zinc-100 pb-3 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#2B7FFF]" />
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Audit Log History</span>
          </div>
          <button
            onClick={fetchRatesHistory}
            disabled={loadingHistory}
            className="text-[10px] text-[#2B7FFF] hover:text-[#2B7FFF] font-bold flex items-center gap-1 cursor-pointer disabled:text-indigo-450"
          >
            <RefreshCw className={`w-3 h-3 ${loadingHistory ? "animate-spin" : ""}`} /> Refresh Log
          </button>
        </div>

        {loadingHistory && history.length === 0 ? (
          <div className="space-y-3 py-4 animate-pulse">
            <div className="h-6 bg-zinc-50 border border-zinc-200 rounded-xl" />
            <div className="h-6 bg-zinc-50 border border-zinc-200 rounded-xl" />
            <div className="h-6 bg-zinc-50 border border-zinc-200 rounded-xl" />
          </div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 font-medium">
            No audit records found on the server.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-2 px-1">Date</th>
                  <th className="py-2 px-1">Parameter Field</th>
                  <th className="py-2 px-1">Previous</th>
                  <th className="py-2 px-1">Updated To</th>
                  <th className="py-2 px-1 text-right">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 font-medium text-zinc-600">
                {history.map((record, index) => {
                  const dateVal = record.changed_at || record.created_at || record.updated_at;
                  
                  const dateStr = dateVal ? parseUtcDate(dateVal).toLocaleString() : "N/A";
                  const actor = getActorForRecord(record);
                  
                  const formatFieldName = (f) => {
                    if (f === "inflation_pre") return "Pre-Retirement Inflation";
                    if (f === "roi_pre") return "Pre-Retirement ROI";
                    if (f === "inflation_post") return "Post-Retirement Inflation";
                    if (f === "roi_post") return "Post-Retirement ROI";
                    if (f === "pf_growth") return "Yearly Growth in PF Contribution";
                    return f;
                  };

                  const formatRateValue = (v) => {
                    if (v === undefined || v === null) return "—";
                    return `${(v * 100).toFixed(2)}%`;
                  };

                  return (
                    <tr key={record.id || index} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-2.5 px-1 font-mono text-[10px] text-zinc-400 whitespace-nowrap">{dateStr}</td>
                      <td className="py-2.5 px-1 font-bold text-zinc-700">{formatFieldName(record.field)}</td>
                      <td className="py-2.5 px-1 text-zinc-500 line-through decoration-slate-300">{formatRateValue(record.old_value)}</td>
                      <td className="py-2.5 px-1 text-emerald-600 font-extrabold">{formatRateValue(record.new_value)}</td>
                      <td className="py-2.5 px-1 text-right text-zinc-500 font-bold">{actor}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
