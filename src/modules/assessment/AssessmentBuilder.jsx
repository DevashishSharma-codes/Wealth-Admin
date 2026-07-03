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
    calculationResult
  } = useAssessment();

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
    <div className="ww-page">
      {/* Page Header */}
      <div className="ww-page-header">
        <div>
          <h2 className="ww-page-title">Assessment Builder</h2>
          <p className="ww-page-subtitle">Configure and run client financial model estimations.</p>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-xs relative min-h-[380px]">
        {/* Actuarial computation Loader overlay */}
        {isCalculating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-4 z-40 rounded-xl animate-fade-in">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-200 border-t-indigo-600 animate-spin" />
              <Calculator className="w-6 h-6 text-[#2B7FFF] absolute animate-pulse" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-zinc-800">Calculating Retirement Projections...</h3>
              <p className="text-xs text-zinc-400 max-w-xs px-4">Building actuarial calculations and compound assets growth estimations.</p>
            </div>
          </div>
        )}

        {/* API Failure banners */}
        {apiError && (
          <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-800 px-4 py-3.5 rounded-xl text-xs font-semibold flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="flex-1">
              <span className="block font-bold">API Operation Error</span>
              <span className="block text-[10px] text-rose-600 mt-0.5">{apiError}</span>
            </div>
          </div>
        )}

        {/* Steps Navigation indicator */}
        {!showReport && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 border-b border-zinc-100">
            {[
              { n: 1, name: "Communication" },
              { n: 2, name: "Profiles" },
              { n: 3, name: "Dependents" },
              { n: 4, name: "Goals Mapping" },
              { n: 5, name: "Calculation" }
            ].map((item) => (
              <button
                key={item.n}
                onClick={() => goToStep(item.n)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                  step === item.n
                    ? "bg-[#2B7FFF] text-white shadow-xs"
                    : "bg-zinc-50 text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {item.n}. {item.name}
              </button>
            ))}
          </div>
        )}

        {/* View router */}
        {showReport ? <ReportView /> : renderStepComponent()}
      </div>
    </div>
  );
}
