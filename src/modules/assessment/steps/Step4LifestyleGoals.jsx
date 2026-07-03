import React from "react";
import { useAssessment } from "../../../context/AssessmentContext";
import { validateStep4 } from "../../../utils/validators";
import StepNavigation from "../../../components/UI/StepNavigation";
import FormField from "../../../components/UI/FormField";
import { Target, Plus, Trash2, Milestone } from "lucide-react";

export default function Step4LifestyleGoals() {
  const {
    activeGoals,
    addGoal,
    removeGoal,
    updateGoal,
    submitStep4,
    prevStep,
    isSubmitting
  } = useAssessment();

  const goalCategories = [
    "Home Purchase",
    "Car Purchase",
    "Home Renovation",
    "Holiday Home",
    "Foreign Tour",
    "Family Gifting",
    "Charity",
    "Child Birth Expenses",
    "Big Purchases",
    "Estate For Children"
  ];

  const handleGoalInputChange = (id, field, value) => {
    updateGoal(id, { [field]: value });
  };

  const isValid = validateStep4(activeGoals);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-zinc-200 pb-3 flex items-center gap-2 select-none">
        <Target className="w-5 h-5 text-[#2B7FFF] shrink-0" />
        <div>
          <h3 className="text-sm font-bold text-zinc-800 leading-none">Lifestyle Goals</h3>
          <p className="text-[10px] text-zinc-400 font-medium mt-1">Select other life milestones to factor into wealth plans.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Quick Goal Selectors */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Available Goal Categories</label>
          <div className="flex flex-wrap gap-1.5">
            {goalCategories.map((catName) => {
              const activeCount = activeGoals.filter((g) => g.type === catName).length;
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => addGoal(catName)}
                  className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    activeCount > 0
                      ? "bg-[#2B7FFF]/5 border-indigo-200 text-[#2B7FFF] shadow-xs"
                      : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100/50"
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" /> {catName} {activeCount > 0 && `(${activeCount})`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Goals Configuration */}
        <div className="space-y-4 pt-3 border-t border-zinc-200">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Selected Goals Configuration</h4>
          
          {activeGoals.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400 bg-zinc-50/50 border border-zinc-200 border-dashed rounded-xl">
              No lifestyle goals selected yet. Add categories above to configure.
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal, idx) => (
                <div key={goal.id} className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-200 flex flex-col md:flex-row md:items-center gap-4 text-xs animate-fade-in">
                  <div className="font-bold text-zinc-700 md:w-44 shrink-0 flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-[#2B7FFF] shrink-0" />
                    <span>{goal.type} #{idx + 1}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label="Target Year (YYYY)"
                      name={`goal-year-${goal.id}`}
                      value={goal.targetYear}
                      onChange={(e) => handleGoalInputChange(goal.id, "targetYear", e.target.value)}
                      placeholder="e.g. 2038"
                      type="number"
                      required={false}
                    />
                    <FormField
                      label="Today's Cost (INR)"
                      name={`goal-cost-${goal.id}`}
                      value={goal.todaysCost}
                      onChange={(e) => handleGoalInputChange(goal.id, "todaysCost", e.target.value)}
                      placeholder="e.g. 2000000"
                      type="number"
                      required={false}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeGoal(goal.id)}
                    className="p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100/50 rounded-xl cursor-pointer transition-colors self-end md:self-center text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <StepNavigation
        onBack={prevStep}
        onNext={submitStep4}
        isDisabled={!isValid}
        isLoading={isSubmitting}
      />
    </div>
  );
}
