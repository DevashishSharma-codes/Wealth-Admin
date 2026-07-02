import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ activeTab, setActiveTab, globalSearch, setGlobalSearch, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans relative overflow-hidden">
      {/* Mobile Sidebar Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs z-35 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden w-full">
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Scrollable Sub-View Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
