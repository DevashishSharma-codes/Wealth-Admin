import React from "react";

export default function AdminBadge({ 
  active, 
  activeText = "Active", 
  inactiveText = "Inactive", 
  onClick, 
  icon = null,
  activeClass = "bg-emerald-50 border-emerald-100 text-emerald-700",
  inactiveClass = "bg-zinc-100 border-zinc-200 text-zinc-500"
}) {
  const content = (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold border transition-all ${
      active ? activeClass : inactiveClass
    }`}>
      {icon ? icon : <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-zinc-400"}`} />}
      {active ? activeText : inactiveText}
    </span>
  );

  if (onClick) {
    return (
      <button 
        type="button" 
        onClick={onClick} 
        className="cursor-pointer focus:outline-none transition-transform hover:scale-[1.03] active:scale-95 inline-flex"
      >
        {content}
      </button>
    );
  }

  return content;
}
