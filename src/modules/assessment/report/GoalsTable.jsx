import React from "react";

export function GoalsTable({ calculationResult }) {
  if (!calculationResult || !calculationResult.goals || !calculationResult.goals.items || calculationResult.goals.items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-[#2B7FFF] uppercase tracking-wider mb-3 border-b border-zinc-100 pb-2">
        Goal Achievement SIP Plan
      </h4>
      <div className="overflow-x-auto border border-zinc-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-150 text-zinc-400 font-medium bg-zinc-50/50">
              <th className="py-2.5 px-3">Goal Description</th>
              <th className="py-2.5 px-3 text-center">Target Year</th>
              <th className="py-2.5 px-3 text-right">Cost (Today)</th>
              <th className="py-2.5 px-3 text-right">Future Cost (Inflated)</th>
              <th className="py-2.5 px-3 text-right text-[#2B7FFF]">Monthly SIP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 font-medium text-zinc-700">
            {calculationResult.goals.items.map((g, idx) => (
              <tr key={idx} className="hover:bg-zinc-50/30">
                <td className="py-2.5 px-3 font-semibold text-zinc-800">{g.goal}</td>
                <td className="py-2.5 px-3 text-center text-zinc-500">{g.target_year}</td>
                <td className="py-2.5 px-3 text-right text-zinc-500">{g.current_cost.inr}</td>
                <td className="py-2.5 px-3 text-right text-zinc-500">{g.future_cost.inr}</td>
                <td className="py-2.5 px-3 text-right text-[#2B7FFF] font-bold">{g.monthly_sip.inr}</td>
              </tr>
            ))}
            <tr className="bg-zinc-50/50 font-bold border-t border-slate-150">
              <td colSpan="4" className="py-3 px-3 text-right text-slate-650 text-[10px]">Total Goals Monthly SIP</td>
              <td className="py-3 px-3 text-right text-[#2B7FFF] text-xs">{calculationResult.goals.total_monthly_sip.inr}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
