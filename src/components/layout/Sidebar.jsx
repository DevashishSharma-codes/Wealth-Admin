import React, { useState, useEffect } from "react";
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
  Briefcase,
  MessageSquare,
  LogOut,
  PanelLeft,
  ChevronRight,
  ChevronLeft,
  X,
  Minus,
  Maximize2,
  Minimize2
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

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) {
  const { currentUser, logout } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  const menuSections = [
    {
      title: "Platform",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "users", label: "Users & Assessments", icon: Users },
      ]
    },
    {
      title: "Data & Reports",
      items: [
        { id: "builder", label: "Assessment Builder", icon: FileSpreadsheet },
        { id: "reports", label: "Reports", icon: FileText },
        { id: "rates", label: "Rate Configuration", icon: Sliders },
        { id: "upload", label: "Excel Upload", icon: UploadCloud },
      ]
    },
    {
      title: "Services & Outreach",
      items: [
        { id: "services", label: "Manage Services", icon: Briefcase },
        { id: "testimonials", label: "Manage Testimonials", icon: MessageSquare },
        { id: "email", label: "Email & Marketing", icon: Mail },
      ]
    },
    {
      title: "Developer Settings",
      devOnly: true,
      items: [
        { id: "logs", label: "API Logs", icon: Terminal },
        { id: "settings", label: "Settings", icon: Settings },
      ]
    }
  ];

  return (
    <aside
      className={`bg-[#F6F7FA]/90 backdrop-blur-3xl border-r border-slate-200/80 shadow-[inset_-1px_0_0_rgba(255,255,255,0.7)] min-h-screen flex flex-col transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0
        fixed inset-y-0 left-0 z-40 lg:relative lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${
          isCollapsed ? "lg:w-[68px]" : "lg:w-[250px]"
        } w-[250px] relative select-none`}
    >
      {/* Native macOS Sidebar Window Header with Working Interactive Traffic Light Controls */}
      <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-200/60 bg-white/40 backdrop-blur-md shrink-0">
        {(!isCollapsed || isMobileOpen) ? (
          <div className="flex items-center justify-between w-full">
            {/* macOS Window Traffic Lights - Interactive & Working */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 group/traffic">
                {/* Red Dot (🔴): Sign Out / Close Session */}
                <button
                  type="button"
                  onClick={logout}
                  className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs flex items-center justify-center text-[#4C0000] hover:bg-[#E0443E] transition-all cursor-pointer group/dot"
                  title="Close Session / Sign Out"
                >
                  <X className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                </button>

                {/* Yellow Dot (🟡): Minimize / Collapse Sidebar */}
                <button
                  type="button"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-2xs flex items-center justify-center text-[#5C4000] hover:bg-[#DEA123] transition-all cursor-pointer group/dot"
                  title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
                >
                  <Minus className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                </button>

                {/* Green Dot (🟢): Fullscreen / Expand Window */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-2xs flex items-center justify-center text-[#0A4D00] hover:bg-[#1AAB29] transition-all cursor-pointer group/dot"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                  ) : (
                    <Maximize2 className="w-2 h-2 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
                  )}
                </button>
              </div>

              <div className="h-4 w-px bg-slate-200/80 mx-1" />
              <img src="/logo.png" alt="Wealth Wisdom" className="h-6 max-w-[105px] object-contain shrink-0" />
            </div>

            {/* Native macOS Sidebar Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors cursor-pointer hidden lg:flex items-center justify-center"
              title="Toggle Sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full gap-2 py-1">
            {/* Interactive Traffic Lights in Collapsed Header */}
            <div className="flex items-center gap-1 group/traffic">
              <button
                type="button"
                onClick={logout}
                className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] border border-[#E0443E] shadow-2xs flex items-center justify-center text-[#4C0000] cursor-pointer"
                title="Sign Out"
              >
                <X className="w-1.5 h-1.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] border border-[#DEA123] shadow-2xs flex items-center justify-center text-[#5C4000] cursor-pointer"
                title="Expand Sidebar"
              >
                <Minus className="w-1.5 h-1.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
              </button>
              <button
                type="button"
                onClick={toggleFullscreen}
                className="w-2.5 h-2.5 rounded-full bg-[#27C93F] border border-[#1AAB29] shadow-2xs flex items-center justify-center text-[#0A4D00] cursor-pointer"
                title="Fullscreen"
              >
                <Maximize2 className="w-1.5 h-1.5 opacity-0 group-hover/traffic:opacity-100 transition-opacity stroke-[3]" />
              </button>
            </div>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-black/5 transition-colors cursor-pointer"
              title="Expand Sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Collapse Edge Pill Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-16 z-50 w-6 h-6 bg-white border border-slate-200 shadow-sm rounded-full hidden lg:flex items-center justify-center text-slate-400 hover:text-[#007AFF] hover:border-[#007AFF]/40 hover:scale-110 transition-all cursor-pointer"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation menu list */}
      <nav className="flex-1 px-2.5 py-3 space-y-3 overflow-y-auto">
        {menuSections
          .filter((section) => !section.devOnly || currentUser?.role === "Developer")
          .map((section, idx) => (
            <div key={idx} className="space-y-0.5">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-2.5 mt-3 mb-1 text-[10.5px] font-semibold tracking-wider text-slate-400/90 uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    className={`group w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-[#007AFF] text-white font-semibold shadow-[0_1px_3px_rgba(0,122,255,0.35)]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-black/[0.04] active:bg-black/[0.07]"
                    } ${isCollapsed && !isMobileOpen ? "justify-center px-0 py-2" : ""}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                    }`} />
                    {(!isCollapsed || isMobileOpen) && (
                      <span className="truncate tracking-tight">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
      </nav>

      {/* macOS Native Bottom User Profile Tile */}
      <div className="p-2.5 border-t border-slate-200/60 bg-white/30 backdrop-blur-md flex flex-col gap-1.5 shrink-0">
        <div
          className={`flex items-center gap-2.5 p-1.5 rounded-xl bg-white/70 border border-white/90 shadow-2xs ${
            (isCollapsed && !isMobileOpen) ? "justify-center p-1.5" : ""
          }`}
        >
          <div className="relative shrink-0">
            <div className="w-7 h-7 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/25 flex items-center justify-center text-[#007AFF] font-bold text-xs">
              {getInitials(currentUser?.role)}
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white absolute -bottom-0.5 -right-0.5" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="overflow-hidden flex-1 text-left">
              <span className="block text-[12px] font-bold text-slate-800 truncate leading-tight">
                {currentUser?.role || "User"}
              </span>
              <span className="block text-[10px] text-slate-400 truncate font-mono">
                @{currentUser?.username || "admin"}
              </span>
            </div>
          )}
        </div>

        {/* macOS Style Sign Out Action */}
        <button
          onClick={logout}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer ${
            (isCollapsed && !isMobileOpen) ? "justify-center px-0" : ""
          }`}
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {(!isCollapsed || isMobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
