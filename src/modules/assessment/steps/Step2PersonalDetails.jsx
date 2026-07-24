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
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="border-b border-zinc-100 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#2B7FFF] shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 leading-tight">Personal Details</h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Specify client and spouse professional background & monthly expense (optional).</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Client Info Section */}
        <div className="space-y-4">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-[#2B7FFF] pl-2.5 select-none">
            Client Information
          </div>

          <FormField
            label="Your Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Your Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
              placeholder="Enter occupation sector"
              required={false}
            />
            <FormField
              label="Your Designation"
              name="designation"
              value={formData.designation}
              onChange={handleInputChange}
              placeholder="Enter designation title"
              required={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Your Company Name"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="Enter company name"
              required={false}
            />
            <DatePicker
              label="Your Date Of Birth"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              required={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2">
            <FormField
              label="Your Monthly Household Expense (INR)"
              name="monthlyExpense"
              value={formData.monthlyExpense}
              onChange={handleInputChange}
              placeholder="Enter monthly expense value"
              type="number"
              required={false}
            />
          </div>
        </div>

        {/* Spouse Info Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-[#2B7FFF] pl-2.5 select-none">
            Spouse Information
          </div>

          <FormField
            label="Spouse Name"
            name="spouseName"
            value={formData.spouseName}
            onChange={handleInputChange}
            placeholder="Enter spouse full name"
            required={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

      <div className="pt-4 border-t border-zinc-100">
        <StepNavigation
          onBack={prevStep}
          onNext={submitStep2}
          isDisabled={!isValid}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
