import React from "react";
import { useAssessment } from "../../../context/AssessmentContext";
import StepNavigation from "../../../components/UI/StepNavigation";
import FormField from "../../../components/UI/FormField";
import { Calculator } from "lucide-react";

export default function Step5RetirementSavings() {
  const {
    formData,
    updateFormData,
    submitStep5,
    prevStep,
    isCalculating
  } = useAssessment();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      [name]: type === "checkbox" ? checked : value
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="border-b border-zinc-100 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#2B7FFF] shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 leading-tight">Current Retirement Savings</h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Review target retirement parameters and accumulated holdings (optional).</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Core Parameters */}
        <div className="space-y-4">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-[#2B7FFF] pl-2.5 select-none">
            Retirement Plan Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Target Retirement Age"
              name="targetRetireAge"
              value={formData.targetRetireAge}
              onChange={handleInputChange}
              placeholder="Enter target retirement age"
              type="number"
              required={false}
            />
            <FormField
              label="Years Until Retirement"
              name="yearsUntilRetirement"
              value={formData.yearsUntilRetirement}
              onChange={handleInputChange}
              placeholder="Enter years remaining"
              type="number"
              required={false}
            />
          </div>

          <FormField
            label="Required Annual Income (Today's Value)"
            name="requiredAnnualIncome"
            value={formData.requiredAnnualIncome}
            onChange={handleInputChange}
            placeholder="Enter annual income required"
            type="number"
            required={false}
          />
        </div>

        {/* EPF Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-[#2B7FFF] pl-2.5 select-none">
            Employees' Provident Fund (EPF)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Employer's Share (Monthly)"
              name="epfEmployerShare"
              value={formData.epfEmployerShare}
              onChange={handleInputChange}
              placeholder="Enter employer contribution"
              type="number"
              required={false}
            />
            <FormField
              label="Employee's Share (Monthly)"
              name="epfEmployeeShare"
              value={formData.epfEmployeeShare}
              onChange={handleInputChange}
              placeholder="Enter employee contribution"
              type="number"
              required={false}
            />
          </div>
          <FormField
            label="Total Accumulated Corpus"
            name="epfTotalCorpus"
            value={formData.epfTotalCorpus}
            onChange={handleInputChange}
            placeholder="Enter accumulated corpus total"
            type="number"
            required={false}
          />
        </div>

        {/* NPS Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-[#2B7FFF] pl-2.5 select-none">
            National Pension System (NPS)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Employer's Contribution (Monthly)"
              name="npsEmployerShare"
              value={formData.npsEmployerShare}
              onChange={handleInputChange}
              placeholder="Enter employer contribution"
              type="number"
              required={false}
            />
            <FormField
              label="Employee's Contribution (Monthly)"
              name="npsEmployeeShare"
              value={formData.npsEmployeeShare}
              onChange={handleInputChange}
              placeholder="Enter employee contribution"
              type="number"
              required={false}
            />
          </div>
          <FormField
            label="Total Accumulated Corpus"
            name="npsTotalCorpus"
            value={formData.npsTotalCorpus}
            onChange={handleInputChange}
            placeholder="Enter accumulated corpus total"
            type="number"
            required={false}
          />
        </div>

        {/* Superannuation Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-[#2B7FFF] pl-2.5 select-none">
            Superannuation Fund
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Employer's Share (Monthly)"
              name="superEmployerShare"
              value={formData.superEmployerShare}
              onChange={handleInputChange}
              placeholder="Enter employer contribution"
              type="number"
              required={false}
            />
            <FormField
              label="Total Accumulated Corpus"
              name="superTotalCorpus"
              value={formData.superTotalCorpus}
              onChange={handleInputChange}
              placeholder="Enter accumulated corpus total"
              type="number"
              required={false}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-100">
        <StepNavigation
          onBack={prevStep}
          onNext={submitStep5}
          nextLabel="Submit & Calculate"
          isDisabled={false}
          isLoading={isCalculating}
        />
      </div>
    </div>
  );
}
