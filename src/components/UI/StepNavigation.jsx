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
    <div className="flex items-center gap-4 pt-4 border-t border-zinc-100 mt-6">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-all text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 cursor-pointer border border-zinc-200/80 bg-white shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={isDisabled || isLoading}
        className="ml-auto bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 disabled:bg-zinc-200 disabled:text-zinc-400 text-white flex items-center gap-2 text-xs sm:text-sm font-bold px-7 py-3 rounded-xl transition-all disabled:cursor-not-allowed cursor-pointer shadow-md shadow-blue-500/20 active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
          </>
        ) : (
          <>
            {nextLabel} <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
