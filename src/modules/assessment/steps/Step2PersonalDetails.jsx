import React from "react";
import { useAssessment } from "../../../context/AssessmentContext";
import { validateStep2 } from "../../../utils/validators";
import StepNavigation from "../../../components/UI/StepNavigation";
import FormField from "../../../components/UI/FormField";
import DatePicker from "../../../components/UI/DatePicker";
import { User } from "lucide-react";

export default function Step2PersonalDetails() {
  const {
    formData,
    updateFormData,
    submitStep2,
    prevStep,
    isSubmitting
  } = useAssessment();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      [name]: type === "checkbox" ? checked : value
    });
  };

  const isValid = validateStep2(formData);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200 pb-3 flex items-center gap-2 select-none">
        <User className="w-5 h-5 text-[#2B7FFF] shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-zinc-800 leading-none">Personal Details</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">Specify current employment and monthly expenditure data.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Client info */}
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-slate-300 pl-2 mb-2 select-none">
            Client Information
          </div>

          <FormField
            label="Your Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Your Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              placeholder="Enter occupation sector"
              required={true}
            />
            <FormField
              label="Your Designation"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="Enter designation title"
              required={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Your Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter company name"
              required={true}
            />
            <DatePicker
              label="Your Date Of Birth"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              required={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <FormField
              label="Your Monthly Household Expense"
              name="monthlyExpense"
              value={formData.monthlyExpense}
              onChange={handleInputChange}
              placeholder="Enter monthly expense value (INR)"
              type="number"
              required={true}
            />
          </div>
        </div>

        {/* Spouse info */}
        <div className="space-y-4 pt-3 border-t border-zinc-200">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-slate-300 pl-2 mb-2 select-none">
            Spouse Information (Optional)
          </div>

          <FormField
            label="Spouse Name"
            name="spouseName"
            value={formData.spouseName}
            onChange={handleInputChange}
            placeholder="Enter spouse name"
            required={false}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Spouse Occupation"
              name="spouseOccupation"
              value={formData.spouseOccupation}
              onChange={handleInputChange}
              placeholder="Enter spouse occupation"
              required={false}
            />
            <FormField
              label="Spouse Designation"
              name="spouseDesignation"
              value={formData.spouseDesignation}
              onChange={handleInputChange}
              placeholder="Enter spouse designation"
              required={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Spouse Company Name"
              name="spouseCompanyName"
              value={formData.spouseCompanyName}
              onChange={handleInputChange}
              placeholder="Enter spouse company"
              required={false}
            />
            <DatePicker
              label="Spouse Date Of Birth"
              name="spouseDob"
              value={formData.spouseDob}
              onChange={handleInputChange}
              required={false}
            />
          </div>
        </div>
      </div>

      <StepNavigation
        onBack={prevStep}
        onNext={submitStep2}
        isDisabled={!isValid}
        isLoading={isSubmitting}
      />
    </div>
  );
}
