import React from "react";

/**
 * Reusable status toggle used in table rows.
 * Styling matches the toggle already used inside the Add/Edit modals
 * (emerald when on, zinc when off) so the whole panel feels consistent.
 */
export default function StatusToggle({
  checked,
  onChange,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="inline-flex items-center gap-2.5 cursor-pointer group select-none"
    >
      <span
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
          checked ? "bg-emerald-500" : "bg-zinc-200 group-hover:bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
            checked ? "left-4" : "left-0.5"
          }`}
        />
      </span>
      <span
        className={`text-[11px] font-bold tracking-wide transition-colors ${
          checked ? "text-emerald-600" : "text-zinc-400"
        }`}
      >
        {checked ? activeLabel : inactiveLabel}
      </span>
    </button>
  );
}