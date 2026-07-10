import React from "react";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  FileText,
  Sliders,
  UploadCloud,
  Mail,
  Terminal,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MessageSquare,
  History,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function getInitials(name) {
  if (!name) return "U";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

export default function Sidebar({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users & Assessments", icon: Users },
    { id: "builder", label: "Assessment Builder", icon: FileSpreadsheet },
    { id: "reports", label: "Reports", icon: FileText },
    { id: "rates", label: "Rate Configuration", icon: Sliders },
    { id: "upload", label: "Excel Upload", icon: UploadCloud },
    { id: "services", label: "Manage Services", icon: Briefcase },
    { id: "testimonials", label: "Manage Testimonials", icon: MessageSquare },
    { id: "email", label: "Email & Marketing", icon: Mail },
    { id: "logs", label: "API Logs", icon: Terminal },
    // { id: "activity-logs", label: "Activity Logs", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside
      className={`bg-white border-r border-zinc-200 min-h-screen flex flex-col transition-all duration-300 shrink-0
        fixed inset-y-0 left-0 z-40 lg:relative lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          isCollapsed ? "lg:w-16" : "lg:w-64"
        } w-64`}
    >
      {/* Title / Logo Header */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-zinc-100">
        {(!isCollapsed || isMobileOpen) && (
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Wealth Wisdom" className="h-9 w-auto object-contain shrink-0" />
            <div className="border-l border-zinc-200 pl-2.5">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider block">
                Enterprise
              </span>
              <span className="text-[9px] text-[#2B7FFF] font-bold uppercase tracking-wider block -mt-0.5">
                Admin
              </span>
            </div>
          </div>
        )}
        {(isCollapsed && !isMobileOpen) && (
          <img src="/logo.png" alt="WW" className="w-8 h-8 object-contain mx-auto" />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 w-6 h-6 bg-white border border-zinc-200 rounded-full hidden lg:flex items-center justify-center text-zinc-400 hover:text-zinc-600 shadow-sm cursor-pointer hover:bg-zinc-50"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems
          .filter((item) => {
            const isDevOnly = item.id === "logs" || item.id === "settings";
            return !isDevOnly || currentUser?.role === "Developer";
          })
          .map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#2B7FFF]/5 text-[#2B7FFF] font-semibold"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-[#2B7FFF]" : "text-zinc-400"}`} />
              {(!isCollapsed || isMobileOpen) && <span className="text-sm tracking-wide">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Details */}
      <div className="p-3 border-t border-zinc-100 flex flex-col gap-2">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-zinc-50/50 ${
            (isCollapsed && !isMobileOpen) ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#2B7FFF]/10 border border-[#2B7FFF]/20 flex items-center justify-center overflow-hidden shrink-0">
            <span className="text-xs font-bold text-[#2B7FFF]">
              {getInitials(currentUser?.role)}
            </span>
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="overflow-hidden flex-1 text-left">
              <span className="block text-xs font-bold text-zinc-800 truncate">
                {currentUser?.role || "User"}
              </span>
              <span className="block text-[10px] font-semibold text-zinc-400 truncate -mt-0.5 font-mono">
                @{currentUser?.username || "username"}
              </span>
            </div>
          )}
        </div>
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 cursor-pointer transition-all duration-200 ${
            (isCollapsed && !isMobileOpen) ? "justify-center" : ""
          }`}
          title="Sign Out"
        >
          <LogOut className="w-4.5 h-4.5 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span className="text-xs font-bold">Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}

