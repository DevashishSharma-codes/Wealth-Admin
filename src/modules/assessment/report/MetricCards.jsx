import React from "react";

export function MetricCards({ displayInsurance, displayCorpus, displayMonthly }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
      <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-xs">
        <span className="text-[10px] font-bold text-zinc-400 block uppercase">Recommended Monthly SIP</span>
        <span className="text-2xl font-extrabold text-[#2B7FFF] block mt-2">₹{displayMonthly}</span>
        <span className="text-[10px] text-zinc-400 block mt-1">suggested savings rate</span>
      </div>
      <div className="bg-white border border-zinc-200 p-5 rounded-xl text-center shadow-xs">
        <span className="text-[10px] font-bold text-zinc-400 block uppercase">Retirement Corpus Target</span>
        <span className="text-2xl font-extrabold text-[#2B7FFF] block mt-2">₹{displayCorpus} Cr</span>
        <span className="text-[10px] text-zinc-400 block mt-1">corpus size adjusted for inflation</span>
      </div>
      <div className="bg-white border border-zinc-200 p-5 rounded-xl text-center shadow-xs">
        <span className="text-[10px] font-bold text-zinc-400 block uppercase">Insurance Cover GAP</span>
        <span className="text-2xl font-extrabold text-[#2B7FFF] block mt-2">₹{displayInsurance} Cr</span>
        <span className="text-[10px] text-zinc-400 block mt-1">recommended life insurance shortfall</span>
      </div>
    </div>
  );
}
