import React from "react";

export function InsuranceTable({ calculationResult }) {
  if (!calculationResult || !calculationResult.insurance || !calculationResult.insurance.items || calculationResult.insurance.items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider mb-3 border-b border-zinc-100 pb-2">
        Risk Protection & Insurance Needs
      </h4>
      <div className="overflow-x-auto border border-zinc-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-150 text-zinc-400 font-medium bg-zinc-50/50">
              <th className="py-2.5 px-3">Insurance Need Type</th>
              <th className="py-2.5 px-3 text-center">Duration</th>
              <th className="py-2.5 px-3 text-right">Required Cover</th>
              <th className="py-2.5 px-3 text-center">Protection Type</th>
              <th className="py-2.5 px-3 text-right">Present Value (PV)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 font-medium text-slate-750">
            {calculationResult.insurance.items.map((ins, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/30">
                <td className="py-2.5 px-3 font-semibold text-zinc-800">{ins.need}</td>
                <td className="py-2.5 px-3 text-center text-slate-550">{ins.years} Years</td>
                <td className="py-2.5 px-3 text-right text-zinc-500">{ins.amount.inr}</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-50 text-amber-600 border border-amber-100">
                    {ins.type}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-zinc-800 font-bold">{ins.pv.inr}</td>
              </tr>
            ))}
            <tr className="bg-zinc-50/50 font-bold border-t border-slate-150">
              <td colSpan="4" className="py-3 px-3 text-right text-slate-650 text-[10px]">Total Life Coverage Recommended</td>
              <td className="py-3 px-3 text-right text-zinc-800 text-xs">{calculationResult.insurance.total_required.inr}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
