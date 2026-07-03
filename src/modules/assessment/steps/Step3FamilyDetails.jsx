import React from "react";
import { useAssessment } from "../../../context/AssessmentContext";
import { validateStep3 } from "../../../utils/validators";
import StepNavigation from "../../../components/UI/StepNavigation";
import FormField from "../../../components/UI/FormField";
import DatePicker from "../../../components/UI/DatePicker";
import { Heart, UserPlus, Target } from "lucide-react";

export default function Step3FamilyDetails() {
  const {
    childrenCount,
    setChildrenCount,
    childrenData,
    updateChild,
    submitStep3,
    prevStep,
    isSubmitting
  } = useAssessment();

  const handleChildInputChange = (index, field, value) => {
    updateChild(index, { [field]: value });
  };

  const isValid = validateStep3(childrenData, childrenCount);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200 pb-3 flex items-center gap-2 select-none">
        <Heart className="w-5 h-5 text-[#2B7FFF] shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-zinc-800 leading-none">Family Details</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">Specify dependent children and education milestone parameters.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Child Count Selector */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-zinc-600">NUMBER OF CHILDREN DEPENDENTS:</span>
          <div className="flex border border-zinc-200 rounded-xl p-1 bg-zinc-50 shrink-0">
            {[0, 1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setChildrenCount(n)}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg cursor-pointer ${
                  childrenCount === n ? "bg-white text-[#2B7FFF] shadow-xs" : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic child inputs list */}
        {childrenCount > 0 && (
          <div className="space-y-6 pt-2">
            {Array.from({ length: childrenCount }).map((_, idx) => {
              const child = childrenData[idx] || {};
              return (
                <div key={idx} className="bg-zinc-50/50 p-5 rounded-xl border border-zinc-200 space-y-4 text-xs">
                  <div className="font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-zinc-200">
                    <UserPlus className="w-4 h-4 text-zinc-400" /> Child Dependent #{idx + 1}
                  </div>

                  {/* Personal details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Full Name"
                      name={`child-name-${idx}`}
                      value={child.name}
                      onChange={(e) => handleChildInputChange(idx, "name", e.target.value)}
                      placeholder="Enter child full name"
                      required={false}
                    />
                    <FormField
                      label="Occupation"
                      name={`child-occupation-${idx}`}
                      value={child.occupation}
                      onChange={(e) => handleChildInputChange(idx, "occupation", e.target.value)}
                      placeholder="e.g. Student"
                      required={false}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <DatePicker
                      label="Date Of Birth"
                      name={`child-dob-${idx}`}
                      value={child.dob}
                      onChange={(e) => handleChildInputChange(idx, "dob", e.target.value)}
                      required={false}
                    />
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 tracking-wide select-none mb-1">
                        Financially Dependent?
                      </label>
                      <select
                        value={child.dependent || "Yes"}
                        onChange={(e) => handleChildInputChange(idx, "dependent", e.target.value)}
                        className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-2.5 py-2.5 outline-none focus:border-indigo-500 font-medium cursor-pointer"
                      >
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-600 tracking-wide select-none mb-1">
                        Calculated Age
                      </label>
                      <div className="w-full text-xs bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-500 font-bold min-h-[34px]">
                        {child.age || "Pending DOB..."}
                      </div>
                    </div>
                  </div>

                  {/* Goal mappings */}
                  <div className="pt-2 space-y-3">
                    <span className="font-bold text-zinc-500 flex items-center gap-1.5 border-t border-zinc-200 pt-3">
                      <Target className="w-3.5 h-3.5 text-[#2B7FFF]" /> Child Goal Plan (Optional)
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-500 mb-1">GOAL TYPE</label>
                        <select
                          value={child.goalType || ""}
                          onChange={(e) => handleChildInputChange(idx, "goalType", e.target.value)}
                          className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-2.5 py-2.5 outline-none focus:border-indigo-500 font-medium cursor-pointer"
                        >
                          <option value="">Select goal type...</option>
                          <option value="Higher Education">Higher Education</option>
                          <option value="Marriage">Marriage</option>
                          <option value="Business Setup">Business Setup</option>
                          <option value="Career Fund">Career Fund</option>
                          <option value="Others">Others</option>
                        </select>
                      </div>
                      <FormField
                        label="Target Year (YYYY)"
                        name={`child-year-${idx}`}
                        value={child.targetYear}
                        onChange={(e) => handleChildInputChange(idx, "targetYear", e.target.value)}
                        placeholder="e.g. 2035"
                        type="number"
                        required={false}
                      />
                      <FormField
                        label="Today's Cost (INR)"
                        name={`child-cost-${idx}`}
                        value={child.todaysCost}
                        onChange={(e) => handleChildInputChange(idx, "todaysCost", e.target.value)}
                        placeholder="e.g. 1500000"
                        type="number"
                        required={false}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <StepNavigation
        onBack={prevStep}
        onNext={submitStep3}
        isDisabled={!isValid}
        isLoading={isSubmitting}
      />
    </div>
  );
}
