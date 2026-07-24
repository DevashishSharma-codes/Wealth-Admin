import React from "react";
import { useAssessment } from "../../context/AssessmentContext";
import Step1Communication from "./steps/Step1Communication";
import Step2PersonalDetails from "./steps/Step2PersonalDetails";
import Step3FamilyDetails from "./steps/Step3FamilyDetails";
import Step4LifestyleGoals from "./steps/Step4LifestyleGoals";
import Step5RetirementSavings from "./steps/Step5RetirementSavings";
import { ReportView } from "./report/ReportView";
import { Calculator, AlertTriangle } from "lucide-react";

export default function AssessmentBuilder() {
  const {
    step,
    showReport,
    isCalculating,
    apiError,
    goToStep,
  } = useAssessment();

  const stepsList = [
    { n: 1, name: "Communication" },
    { n: 2, name: "Profiles" },
    { n: 3, name: "Dependents" },
    { n: 4, name: "Goals Mapping" },
    { n: 5, name: "Calculation" }
  ];

  const renderStepComponent = () => {
    switch (step) {
      case 1:
        return <Step1Communication />;
      case 2:
        return <Step2PersonalDetails />;
      case 3:
        return <Step3FamilyDetails />;
      case 4:
        return <Step4LifestyleGoals />;
      case 5:
        return <Step5RetirementSavings />;
      default:
        return <Step1Communication />;
    }
  };

  return (
    <div className="ww-page max-w-[1280px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">Assessment Builder</h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">Configure client parameters and run actuarial financial estimations.</p>
        </div>

        {!showReport && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-[#2B7FFF] text-xs font-bold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#2B7FFF] animate-pulse" />
            Step {step} of 5 · {stepsList.find((s) => s.n === step)?.name}
          </div>
        )}
      </div>

      {/* Mac-Style Segmented Steps Navigation */}
      {!showReport && (
        <div className="bg-zinc-100/80 p-1.5 rounded-2xl border border-zinc-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {stepsList.map((item) => {
            const isActive = step === item.n;
            return (
              <button
                key={item.n}
                type="button"
                onClick={() => goToStep(item.n)}
                className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer select-none text-center flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200/80"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-white/50"
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isActive ? "bg-[#2B7FFF] text-white" : "bg-zinc-200 text-zinc-600"
                }`}>
                  {item.n}
                </span>
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Container Card */}
      <div className="bg-white border border-zinc-200/80 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xs relative min-h-[420px]">
        {/* Actuarial computation Loader overlay */}
        {isCalculating && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex flex-col items-center justify-center gap-4 z-40 rounded-2xl sm:rounded-3xl animate-fade-in">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-200 border-t-[#2B7FFF] animate-spin" />
              <Calculator className="w-6 h-6 text-[#2B7FFF] absolute animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-zinc-900">Calculating Retirement Projections...</h3>
              <p className="text-xs text-zinc-400 max-w-xs px-4">Building actuarial calculations and compound assets growth estimations.</p>
            </div>
          </div>
        )}

        {/* API Failure banners */}
        {apiError && (
          <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3.5 rounded-2xl text-xs font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="flex-1">
              <span className="block font-bold">API Operation Error</span>
              <span className="block text-[11px] text-rose-600 mt-0.5">{apiError}</span>
            </div>
          </div>
        )}

        {/* View router */}
        {showReport ? <ReportView /> : renderStepComponent()}
      </div>
    </div>
  );
}
