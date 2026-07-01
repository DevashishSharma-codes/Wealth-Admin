import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ activeTab, setActiveTab, globalSearch, setGlobalSearch, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex bg-zinc-50 min-h-screen font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
        />

        {/* Scrollable Sub-View Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
