import React from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";

export default function StepNavigation({
  onBack,
  onNext,
  nextLabel = "Continue",
  isDisabled = false,
  isLoading = false
}) {
  return (
    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 mt-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={isDisabled || isLoading}
        className="ml-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white flex items-center gap-2 text-xs font-bold px-6 py-2.5 rounded-xl transition-all disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-indigo-600/10"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
          </>
        ) : (
          <>
            {nextLabel} <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </div>
  );
}
