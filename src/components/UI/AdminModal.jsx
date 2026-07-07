import React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function AdminModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-zinc-900/40 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xl max-w-2xl w-full overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
          <h3 className="text-xs font-extrabold text-zinc-800 uppercase tracking-wider">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 p-1.5 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {children}
        </div>
      </div>
    </div>
  );

  // Rendering through a portal into document.body guarantees this modal
  // always covers the true browser viewport and is never boxed in by a
  // parent element that has a filter/backdrop-filter/transform applied
  // (any of those on an ancestor turns it into the containing block for
  // position:fixed children, which is what was cramping the modal before).
  return createPortal(modalContent, document.body);
}