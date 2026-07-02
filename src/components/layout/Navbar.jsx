import React, { useState, useEffect } from "react";
import { Bell, Search, User, Menu } from "lucide-react";
import { getAdminUsers, getAdminLeads, getAdminAssessments } from "../../services/assessmentService";

const parseUtcDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  let s = dateStr.trim();
  if (!s.endsWith("Z") && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s = s.replace(" ", "T") + "Z";
  }
  return new Date(s);
};

export default function Navbar({ activeTab, globalSearch, setGlobalSearch, isMobileOpen, setIsMobileOpen }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const [usersRes, leadsRes, assessmentsRes] = await Promise.all([
        getAdminUsers({ per_page: 50 }).catch(() => ({ data: { items: [] } })),
        getAdminLeads({ per_page: 50 }).catch(() => ({ data: { items: [] } })),
        getAdminAssessments({ per_page: 50 }).catch(() => ({ data: { items: [] } }))
      ]);

      const usersList = usersRes?.data?.items || usersRes?.items || (Array.isArray(usersRes) ? usersRes : []);
      const leadsList = leadsRes?.data?.items || leadsRes?.items || (Array.isArray(leadsRes) ? leadsRes : []);
      const assessmentsList = assessmentsRes?.data?.items || assessmentsRes?.items || (Array.isArray(assessmentsRes) ? assessmentsRes : []);

      const readIds = new Set(JSON.parse(localStorage.getItem("WW_READ_NOTIFICATIONS") || "[]"));
      const list = [];

      usersList.forEach(u => {
        const id = `client-${u.assessment_id || u.email}`;
        if (!readIds.has(id)) {
          list.push({
            id,
            text: `New client profile: ${u.name || u.email || 'Anonymous'}`,
            timestamp: u.created_at ? parseUtcDate(u.created_at) : new Date(),
            type: "client"
          });
        }
      });

      leadsList.forEach(l => {
        const id = `lead-${l.assessment_id || l.email}`;
        if (!readIds.has(id)) {
          list.push({
            id,
            text: `New lead intake: ${l.name || 'Anonymous Lead'}`,
            timestamp: l.created_at ? parseUtcDate(l.created_at) : new Date(),
            type: "lead"
          });
        }
      });

      assessmentsList.forEach(a => {
        const id = `assessment-${a.assessment_id}`;
        if (!readIds.has(id)) {
          list.push({
            id,
            text: `Assessment completed: ${a.name || 'Anonymous Client'}`,
            timestamp: a.created_at ? parseUtcDate(a.created_at) : new Date(),
            type: "assessment"
          });
        }
      });

      list.sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(list);
    } catch (error) {
      console.error("[Navbar] Failed to load dynamic notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id) => {
    const readIds = JSON.parse(localStorage.getItem("WW_READ_NOTIFICATIONS") || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem("WW_READ_NOTIFICATIONS", JSON.stringify(readIds));
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllAsRead = () => {
    const readIds = JSON.parse(localStorage.getItem("WW_READ_NOTIFICATIONS") || "[]");
    notifications.forEach(n => {
      if (!readIds.includes(n.id)) {
        readIds.push(n.id);
      }
    });
    localStorage.setItem("WW_READ_NOTIFICATIONS", JSON.stringify(readIds));
    setNotifications([]);
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: "Executive Dashboard",
      users: "Users & Assessments",
      builder: "Assessment Builder (Admin Mode)",
      reports: "Client Reports Database",
      rates: "Rate Configuration",
      upload: "Bulk Excel Upload",
      email: "Email Campaign & Marketing",
      logs: "API Key Management & Access Logs",
      settings: "System settings",
    };
    return titles[activeTab] || "Wealth Wisdom";
  };

  const unreadCount = notifications.length;

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      {/* Title / Active Tab indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Wealth Wisdom Platform
          </p>
          <h1 className="text-xs font-bold text-zinc-700 md:hidden -mt-0.5">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 w-80 focus-within:border-indigo-200 transition-colors">
        <Search className="w-4 h-4 text-zinc-400 shrink-0" />
        <input
          type="text"
          placeholder="Search insights, assessments, reports..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          className="bg-transparent border-none text-xs text-zinc-700 outline-none w-full placeholder-slate-400"
        />
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Notification center */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-zinc-200 shadow-xl py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[10px] text-[#2B7FFF] hover:text-[#2B7FFF]/80 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-zinc-400">
                    No new alerts
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => markAsRead(item.id)}
                      className="px-4 py-3 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer flex justify-between items-start gap-2"
                      title="Click to dismiss"
                    >
                      <div className="flex-1">
                        <p className="text-xs text-zinc-700 leading-normal">{item.text}</p>
                        <span className="text-[9px] text-zinc-400 mt-1 block">
                          {item.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2B7FFF] shrink-0 mt-1.5" title="Unread" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown indicator */}
        <div className="flex items-center gap-2 border-l border-zinc-200 pl-4">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600 border border-zinc-200 shrink-0 select-none">
            <User className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
