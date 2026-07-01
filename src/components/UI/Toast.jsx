import React, { useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

export default function Toast({ message, type = "info", onClose, duration = 5000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const themes = {
    success: {
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-800",
      icon: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-100",
      text: "text-rose-800",
      icon: <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-100",
      text: "text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    },
  };

  const theme = themes[type] || themes.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 max-w-sm p-4 rounded-xl border shadow-lg bg-white animate-fade-in">
      <div className={`flex items-center gap-3 ${theme.text}`}>
        {theme.icon}
        <span className="text-sm font-medium leading-normal">{message}</span>
      </div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 rounded-lg p-0.5 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
