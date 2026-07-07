import React from "react";

export default function StatusToggle({
  value,
  checked,
  enabled,
  onChange,
  disabled = false,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
}) {
  const isChecked = checked !== undefined ? checked : (value !== undefined ? value : !!enabled);

  const handleToggle = () => {
    if (disabled) return;
    if (onChange) {
      onChange(!isChecked);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={`inline-flex items-center gap-2.5 group select-none ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
          isChecked ? "bg-emerald-500" : "bg-zinc-200 group-hover:bg-zinc-300"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${
            isChecked ? "left-4" : "left-0.5"
          }`}
        />
      </span>
      {(activeLabel || inactiveLabel) && (
        <span
          className={`text-[11px] font-bold tracking-wide transition-colors ${
            isChecked ? "text-emerald-600" : "text-zinc-400"
          }`}
        >
          {isChecked ? activeLabel : inactiveLabel}
        </span>
      )}
    </button>
  );
}