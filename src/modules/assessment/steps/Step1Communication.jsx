import React from "react";
import { useAssessment } from "../../../context/AssessmentContext";
import { validateStep1 } from "../../../utils/validators";
import StepNavigation from "../../../components/UI/StepNavigation";
import FormField from "../../../components/UI/FormField";
import { MessageSquare } from "lucide-react";

export default function Step1Communication() {
  const {
    formData,
    updateFormData,
    submitStep1,
    isSubmitting
  } = useAssessment();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({
      [name]: type === "checkbox" ? checked : value
    });
  };

  const isValid = validateStep1(formData);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="border-b border-zinc-100 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#2B7FFF] shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 leading-tight">Communication Details</h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Provide contact info for client and spouse profiles (all fields optional).</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Contact Information Section */}
        <div className="space-y-4">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-[#2B7FFF] pl-2.5 select-none">
            Client Contact Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
              required={false}
            />
            <FormField
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              type="email"
              required={false}
            />
          </div>

          <FormField
            label="Residential Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter residential address"
            required={false}
          />
        </div>

        {/* Spouse Contact Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-[#2B7FFF] pl-2.5 select-none">
            Spouse Contact Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FormField
              label="Spouse Mobile Number"
              name="spouseMobile"
              value={formData.spouseMobile}
              onChange={handleInputChange}
              placeholder="Enter spouse's mobile number"
              required={false}
            />
            <FormField
              label="Spouse Email Address"
              name="spouseEmail"
              value={formData.spouseEmail}
              onChange={handleInputChange}
              placeholder="Enter spouse's email address"
              type="email"
              required={false}
            />
          </div>
        </div>

      </div>

      <div className="pt-4 border-t border-zinc-100">
        <StepNavigation
          onNext={submitStep1}
          isDisabled={!isValid}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
