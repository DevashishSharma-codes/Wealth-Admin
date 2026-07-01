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
    <div className="space-y-6">
      <div className="border-b border-zinc-200 pb-3 flex items-center gap-2 select-none">
        <MessageSquare className="w-5 h-5 text-[#2B7FFF] shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-zinc-800 leading-none">Communication Details</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">Provide your contact info to secure this assessment profile.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contact information Section */}
        <div className="space-y-4">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-slate-300 pl-2 mb-2 select-none">
            Contact Information
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Mobile Number"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter mobile number"
              required={true}
            />
            <FormField
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              type="email"
              required={true}
            />
          </div>

          <FormField
            label="Residential Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter residential address"
            required={true}
          />
        </div>

        {/* Spouse Contact Section */}
        <div className="space-y-4 pt-2">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider border-l-2 border-slate-300 pl-2 mb-2 select-none">
            Spouse Contact Information
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Consent box */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="consent"
              checked={!!formData.consent}
              onChange={handleInputChange}
              className="mt-0.5"
            />
            <span className="text-[10px] font-bold text-zinc-400 leading-normal">
              I consent to share the communication details and allow contact to save this assessment. *
            </span>
          </label>
        </div>
      </div>

      <StepNavigation
        onNext={submitStep1}
        isDisabled={!isValid}
        isLoading={isSubmitting}
      />
    </div>
  );
}
