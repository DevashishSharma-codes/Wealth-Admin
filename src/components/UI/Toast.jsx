import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClear={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

const themes = {
  success: {
    bg: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-800",
    icon: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />,
  },
  error: {
    bg: "bg-rose-50 border-rose-100",
    text: "text-rose-800",
    icon: <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />,
  },
  info: {
    bg: "bg-blue-50 border-blue-100",
    text: "text-blue-800",
    icon: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  },
};

function ToastContainer({ toasts, onClear }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] space-y-2 max-w-xs w-full pointer-events-none">
      {toasts.map((toast) => {
        const theme = themes[toast.type] || themes.info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3 rounded-lg border shadow-md animate-fade-in w-full ${theme.bg} ${theme.text}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {theme.icon}
              <span className="text-xs font-semibold leading-snug break-words">{toast.message}</span>
            </div>
            <button
              onClick={() => onClear(toast.id)}
              className="text-current opacity-60 hover:opacity-100 rounded-lg p-0.5 transition-colors cursor-pointer shrink-0 ml-auto"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
