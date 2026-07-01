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
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200 pb-3 flex items-center gap-2 select-none">
        <Calculator className="w-5 h-5 text-[#2B7FFF] shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-zinc-800 leading-none">Current Retirement Savings</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">Review target age limits and compile current savings holdings.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Core Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* EPF Section */}
        <div className="space-y-4 pt-3 border-t border-zinc-200">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-slate-300 pl-2 mb-2 select-none">
            Employees' Provident Fund (EPF)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-4 pt-3 border-t border-zinc-200">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-slate-300 pl-2 mb-2 select-none">
            National Pension System (NPS)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="space-y-4 pt-3 border-t border-zinc-200">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-slate-300 pl-2 mb-2 select-none">
            Superannuation Fund
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <StepNavigation
        onBack={prevStep}
        onNext={submitStep5}
        nextLabel="Submit & Calculate"
        isDisabled={false}
        isLoading={isCalculating}
      />
    </div>
  );
}
