import React, { useState } from "react";
import { useAssessment } from "../../../context/AssessmentContext";
import { validateStep3 } from "../../../utils/validators";
import StepNavigation from "../../../components/UI/StepNavigation";
import FormField from "../../../components/UI/FormField";
import DatePicker from "../../../components/UI/DatePicker";
import { Heart, UserPlus, Target, Plus, Trash2 } from "lucide-react";
import { EducationPlanModal } from "../modals/EducationPlanModal";

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

  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [selectedGoalIndex, setSelectedGoalIndex] = useState(0);

  const openEducationModal = (childIndex, goalIndex) => {
    setSelectedChildIndex(childIndex);
    setSelectedGoalIndex(goalIndex);
    setIsEducationModalOpen(true);
  };

  const handleChildInputChange = (index, field, value) => {
    updateChild(index, { [field]: value });
  };

  const handleChildGoalChange = (childIndex, goalIndex, field, value) => {
    const child = childrenData[childIndex] || {
      name: "",
      occupation: "",
      dependent: "Yes",
      dob: "",
      age: "",
      goalType: "",
      targetYear: "",
      todaysCost: "",
      goals: [{ id: Date.now() + Math.random(), goalType: "", targetYear: "", todaysCost: "" }]
    };
    const goalsList = child.goals && Array.isArray(child.goals) ? child.goals : [
      { id: Date.now() + Math.random(), goalType: child.goalType || "", targetYear: child.targetYear || "", todaysCost: child.todaysCost || "" }
    ];
    const updatedGoals = goalsList.map((g, gIdx) => {
      if (gIdx === goalIndex) {
        return { ...g, [field]: value };
      }
      return g;
    });
    updateChild(childIndex, { goals: updatedGoals });
  };

  const handleAddGoalToChild = (childIndex) => {
    const child = childrenData[childIndex] || {
      name: "",
      occupation: "",
      dependent: "Yes",
      dob: "",
      age: "",
      goalType: "",
      targetYear: "",
      todaysCost: "",
      goals: []
    };
    const goalsList = child.goals && Array.isArray(child.goals) ? child.goals : [
      { id: Date.now() + Math.random(), goalType: child.goalType || "", targetYear: child.targetYear || "", todaysCost: child.todaysCost || "" }
    ];
    const updatedGoals = [
      ...goalsList,
      { id: Date.now() + Math.random(), goalType: "", targetYear: "", todaysCost: "" }
    ];
    updateChild(childIndex, { goals: updatedGoals });
  };

  const handleRemoveGoalFromChild = (childIndex, goalIndex) => {
    const child = childrenData[childIndex];
    if (!child || !child.goals || child.goals.length <= 1) return;
    const updatedGoals = child.goals.filter((_, gIdx) => gIdx !== goalIndex);
    updateChild(childIndex, { goals: updatedGoals });
  };

  const isValid = validateStep3(childrenData, childrenCount);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div className="border-b border-zinc-100 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#2B7FFF] shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 leading-tight">Family Details</h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Specify dependent children and education milestone goals (optional).</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Child Count Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider select-none">
            Number of Children Dependents
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex border border-zinc-200/80 rounded-2xl p-1 bg-zinc-50 shrink-0 shadow-2xs">
              {[0, 1, 2, 3, "4+"].map((num) => {
                const parsedNum = num === "4+" ? 4 : num;
                const isSelected = num === "4+" ? childrenCount >= 4 : childrenCount === parsedNum;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setChildrenCount(parsedNum)}
                    className={`w-10 h-9 flex items-center justify-center text-xs font-bold rounded-xl cursor-pointer transition-all ${
                      isSelected ? "bg-white text-[#2B7FFF] shadow-sm border border-zinc-200/80 font-extrabold" : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {childrenCount >= 4 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500">Total: {childrenCount}</span>
                <button
                  type="button"
                  onClick={() => setChildrenCount(childrenCount + 1)}
                  className="px-3 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-[#2B7FFF] rounded-xl cursor-pointer transition-colors"
                >
                  + Add More
                </button>
                <button
                  type="button"
                  onClick={() => childrenCount > 4 && setChildrenCount(childrenCount - 1)}
                  disabled={childrenCount <= 4}
                  className="px-3 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-rose-500 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  - Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic child inputs list */}
        {childrenCount > 0 && (
          <div className="space-y-6 pt-2">
            {Array.from({ length: childrenCount }).map((_, idx) => {
              const child = childrenData[idx] || {
                name: "",
                occupation: "",
                dependent: "Yes",
                dob: "",
                age: "",
                goalType: "",
                targetYear: "",
                todaysCost: "",
                goals: [{ id: "g-" + idx, goalType: "", targetYear: "", todaysCost: "" }]
              };
              const goalsList = child.goals && Array.isArray(child.goals) ? child.goals : [
                { id: Date.now() + Math.random(), goalType: child.goalType || "", targetYear: child.targetYear || "", todaysCost: child.todaysCost || "" }
              ];

              return (
                <div key={idx} className="bg-zinc-50/60 p-5 sm:p-6 rounded-2xl border border-zinc-200/80 space-y-5 text-xs">
                  <div className="font-extrabold text-zinc-800 uppercase tracking-wider flex items-center justify-between pb-3 border-b border-zinc-200/80">
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#2B7FFF]" /> Child Dependent #{idx + 1}
                    </span>
                    <span className="text-[11px] font-bold text-zinc-400 normal-case bg-white px-2.5 py-1 rounded-full border border-zinc-200">
                      {child.name ? child.name : `Child ${idx + 1}`}
                    </span>
                  </div>

                  {/* Personal details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <DatePicker
                      label="Date Of Birth"
                      name={`child-dob-${idx}`}
                      value={child.dob}
                      onChange={(e) => handleChildInputChange(idx, "dob", e.target.value)}
                      required={false}
                    />
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 tracking-wide select-none mb-1.5">
                        Financially Dependent?
                      </label>
                      <select
                        value={child.dependent || "Yes"}
                        onChange={(e) => handleChildInputChange(idx, "dependent", e.target.value)}
                        className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#2B7FFF] font-semibold cursor-pointer shadow-2xs"
                      >
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-700 tracking-wide select-none mb-1.5">
                        Calculated Age
                      </label>
                      <div className="w-full text-xs bg-zinc-100/80 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-zinc-500 font-bold min-h-[38px] flex items-center">
                        {child.age || "Pending DOB..."}
                      </div>
                    </div>
                  </div>

                  {/* Child Goals List */}
                  <div className="pt-3 space-y-3">
                    <div className="font-bold text-zinc-700 flex items-center justify-between border-t border-zinc-200/80 pt-3">
                      <span className="flex items-center gap-1.5 text-xs font-extrabold">
                        <Target className="w-4 h-4 text-[#2B7FFF]" /> Child Goal Plans
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddGoalToChild(idx)}
                        className="text-xs font-bold text-[#2B7FFF] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-zinc-200 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Goal
                      </button>
                    </div>

                    <div className="space-y-3">
                      {goalsList.map((g, gIdx) => (
                        <div key={gIdx} className="bg-white p-4 rounded-xl border border-zinc-200/80 space-y-3 relative shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                              Goal #{gIdx + 1}
                            </span>
                            {goalsList.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveGoalFromChild(idx, gIdx)}
                                className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-zinc-600 mb-1">GOAL TYPE</label>
                              <select
                                value={g.goalType || ""}
                                onChange={(e) => handleChildGoalChange(idx, gIdx, "goalType", e.target.value)}
                                className="w-full text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#2B7FFF] font-semibold cursor-pointer shadow-2xs"
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
                              name={`child-year-${idx}-${gIdx}`}
                              value={g.targetYear}
                              onChange={(e) => handleChildGoalChange(idx, gIdx, "targetYear", e.target.value)}
                              placeholder="e.g. 2035"
                              type="number"
                              required={false}
                            />
                            <FormField
                              label="Today's Cost (INR)"
                              name={`child-cost-${idx}-${gIdx}`}
                              value={g.todaysCost}
                              onChange={(e) => handleChildGoalChange(idx, gIdx, "todaysCost", e.target.value)}
                              placeholder="e.g. 1500000"
                              type="number"
                              required={false}
                            />
                          </div>

                          {g.goalType === "Higher Education" && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => openEducationModal(idx, gIdx)}
                                className="text-[#2B7FFF] text-xs font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                Plan with Dream Colleges / Budget Calculator &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-zinc-100">
        <StepNavigation
          onBack={prevStep}
          onNext={submitStep3}
          isDisabled={!isValid}
          isLoading={isSubmitting}
        />
      </div>

      <EducationPlanModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        child={childrenData[selectedChildIndex]?.goals?.[selectedGoalIndex]}
        onSave={(data) => {
          const child = childrenData[selectedChildIndex];
          const goalsList = child?.goals && Array.isArray(child.goals) ? child.goals : [
            { id: Date.now() + Math.random(), goalType: child?.goalType || "", targetYear: child?.targetYear || "", todaysCost: child?.todaysCost || "" }
          ];
          const updatedGoals = goalsList.map((g, gIdx) => {
            if (gIdx === selectedGoalIndex) {
              return { ...g, ...data };
            }
            return g;
          });
          updateChild(selectedChildIndex, { goals: updatedGoals });
          setIsEducationModalOpen(false);
        }}
      />
    </div>
  );
}
