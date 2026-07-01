import React from "react";

export function RetirementTable({ formData, calculationResult }) {
  if (!calculationResult) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider mb-2 border-b border-zinc-100 pb-2">
        Retirement Income & Corpus Planning
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Client card */}
        <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-200 space-y-3">
          <div className="font-bold text-xs text-zinc-800">Client ({formData.name || "Primary Client"})</div>
          <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-650">
            <div className="flex justify-between border-b border-zinc-200 pb-1">
              <span>Retirement Age:</span>
              <span className="font-bold text-zinc-800">
                {calculationResult.client.years_to_retirement + calculationResult.client.retirement_period - 20} Years
              </span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-1">
              <span>Years to Retire:</span>
              <span className="font-bold text-zinc-800">{calculationResult.client.years_to_retirement} Years</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-1">
              <span>Expense Today:</span>
              <span className="font-bold text-zinc-800">{calculationResult.client.expenses_today_pm.inr}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-1">
              <span>Inflated Expense:</span>
              <span className="font-bold text-zinc-800">{calculationResult.client.expenses_at_retirement_pm.inr}</span>
            </div>
            <div className="col-span-2 flex justify-between border-b border-zinc-200 pb-1 pt-1 font-bold text-[#2B7FFF]">
              <span>Total Required Corpus:</span>
              <span>{calculationResult.client.corpus.inr}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-1">
              <span>Projected PF:</span>
              <span className="font-bold text-zinc-800">{calculationResult.client.pf_corpus.inr}</span>
            </div>
            <div className="flex justify-between border-b border-zinc-200 pb-1">
              <span>Corpus Deficit Gap:</span>
              <span className="font-bold text-rose-600">{calculationResult.client.net_corpus.inr}</span>
            </div>
            <div className="col-span-2 flex justify-between pt-1 font-bold text-[#2B7FFF]">
              <span>Monthly SIP Required:</span>
              <span>{calculationResult.client.monthly_sip.inr} / mo</span>
            </div>
          </div>
        </div>

        {/* Spouse card */}
        {calculationResult.spouse && calculationResult.spouse.corpus.raw > 0 ? (
          <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-200 space-y-3">
            <div className="font-bold text-xs text-zinc-800">Spouse ({formData.spouseName || "Spouse"})</div>
            <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-650">
              <div className="flex justify-between border-b border-zinc-200 pb-1">
                <span>Retirement Age:</span>
                <span className="font-bold text-zinc-800">
                  {calculationResult.spouse.years_to_retirement + calculationResult.spouse.retirement_period - 25} Years
                </span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-1">
                <span>Years to Retire:</span>
                <span className="font-bold text-zinc-800">{calculationResult.spouse.years_to_retirement} Years</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-1">
                <span>Expense Today:</span>
                <span className="font-bold text-zinc-800">{calculationResult.spouse.expenses_today_pm.inr}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-1">
                <span>Inflated Expense:</span>
                <span className="font-bold text-zinc-800">{calculationResult.spouse.expenses_at_retirement_pm.inr}</span>
              </div>
              <div className="col-span-2 flex justify-between border-b border-zinc-200 pb-1 pt-1 font-bold text-[#2B7FFF]">
                <span>Total Required Corpus:</span>
                <span>{calculationResult.spouse.corpus.inr}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-1">
                <span>Projected PF:</span>
                <span className="font-bold text-zinc-800">{calculationResult.spouse.pf_corpus.inr}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-200 pb-1">
                <span>Corpus Deficit Gap:</span>
                <span className="font-bold text-rose-600">{calculationResult.spouse.net_corpus.inr}</span>
              </div>
              <div className="col-span-2 flex justify-between pt-1 font-bold text-[#2B7FFF]">
                <span>Monthly SIP Required:</span>
                <span>{calculationResult.spouse.monthly_sip.inr} / mo</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-50/50 p-6 rounded-xl border border-zinc-200 flex items-center justify-center text-xs text-zinc-400">
            No spouse calculations registered.
          </div>
        )}
      </div>
    </div>
  );
}
