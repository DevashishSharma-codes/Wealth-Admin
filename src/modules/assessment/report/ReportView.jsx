import React from "react";
import { useAssessment } from "../../../context/AssessmentContext";
import { MetricCards } from "./MetricCards";
import { RetirementTable } from "./RetirementTable";
import { GoalsTable } from "./GoalsTable";
import { InsuranceTable } from "./InsuranceTable";
import { Download, RotateCcw, CheckCircle, Loader2 } from "lucide-react";

export function ReportView() {
  const {
    calculationResult,
    formData,
    downloadReport,
    resetAssessment,
    reportId
  } = useAssessment();

  if (!calculationResult) return null;

  const insRaw = calculationResult.insurance?.total_required?.raw || 0;
  const displayInsurance = insRaw > 0 ? Math.round(insRaw).toLocaleString("en-IN") : "0";

  const clientCorpus = calculationResult.client?.corpus?.raw || 0;
  const spouseCorpus = calculationResult.spouse?.corpus?.raw || 0;
  const totalCorpus = clientCorpus + spouseCorpus;
  const displayCorpus = totalCorpus > 0 ? Math.round(totalCorpus).toLocaleString("en-IN") : "0";

  const invSummary = calculationResult.investment_summary || calculationResult.data?.investment_summary;
  const totalMonthlyVal = invSummary?.total_monthly_investment || calculationResult.summary?.monthly_investment_required;
  let displayMonthly = "0";
  if (totalMonthlyVal) {
    if (typeof totalMonthlyVal === "object") {
      displayMonthly = totalMonthlyVal.inr ? totalMonthlyVal.inr.replace(/^₹\s*/, "") : (totalMonthlyVal.display || totalMonthlyVal.raw || "0");
    } else {
      displayMonthly = String(totalMonthlyVal).replace(/^₹\s*/, "");
    }
  } else {
    const clientSip = calculationResult.client?.monthly_sip?.raw || 0;
    const spouseSip = calculationResult.spouse?.monthly_sip?.raw || 0;
    const goalsSip = calculationResult.goals?.total_monthly_sip?.raw || 0;
    displayMonthly = Math.round(clientSip + spouseSip + goalsSip).toLocaleString("en-IN");
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Info Panel */}
      <div className="bg-white border border-zinc-200 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-extrabold text-zinc-800 tracking-tight flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" /> Projections Calculation Completed!
          </h3>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Actuarial projections and assets compounding metrics have been processed successfully.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadReport}
            disabled={!reportId}
            className="px-4 py-2 border border-zinc-200 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed text-[#2B7FFF] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
          >
            {!reportId ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {!reportId ? "Generating PDF..." : "Download PDF Report"}
          </button>
          <button
            onClick={resetAssessment}
            className="px-4 py-2 bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#2B7FFF]/10 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Start New Assessment
          </button>
        </div>
      </div>

      {/* Metric summary boxes */}
      <MetricCards
        displayInsurance={displayInsurance}
        displayCorpus={displayCorpus}
        displayMonthly={displayMonthly}
      />

      {/* Details details grids */}
      <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs space-y-8">
        {/* 1. Retirement Targets Table */}
        <RetirementTable
          formData={formData}
          calculationResult={calculationResult}
        />

        {/* 2. Lifestyle & Education Goals Table */}
        <GoalsTable
          calculationResult={calculationResult}
        />

        {/* 3. Insurance Gap Analysis Table */}
        <InsuranceTable
          calculationResult={calculationResult}
        />
      </div>
    </div>
  );
}
