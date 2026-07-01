import React from "react";

export default function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  error = null,
  className = "",
  rightIcon = null,
  ...props
}) {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-600 tracking-wide select-none">
          {label}
          {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-indigo-500 font-medium transition-all ${
            error ? "border-rose-350 focus:border-rose-500" : ""
          } ${rightIcon ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="text-[10px] text-rose-500 font-semibold">{error}</span>}
    </div>
  );
}
