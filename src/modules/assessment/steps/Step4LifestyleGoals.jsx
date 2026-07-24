import React, { useState } from "react";
import { useAssessment } from "../../../context/AssessmentContext";
import { validateStep4 } from "../../../utils/validators";
import StepNavigation from "../../../components/UI/StepNavigation";
import FormField from "../../../components/UI/FormField";
import {
  Target,
  Plus,
  Trash2,
  Milestone,
  Compass,
  Sparkles,
  Home,
  Car,
  Wrench,
  Palmtree,
  Plane,
  Gift,
  HeartHandshake,
  Baby,
  ShoppingBag,
  Landmark
} from "lucide-react";
import { TripPlanModal } from "../modals/TripPlanModal";
import { CustomGoalModal } from "../modals/CustomGoalModal";

/* ── Lucide Icon map for goal categories (NO EMOJIS) ── */
const GOAL_META = {
  "Home Purchase":        { icon: Home, size: "lg" },
  "Car Purchase":         { icon: Car, size: "md" },
  "Home Renovation":      { icon: Wrench, size: "md" },
  "Holiday Home":         { icon: Palmtree, size: "md" },
  "Foreign Tour":         { icon: Plane, size: "lg" },
  "Family Gifting":       { icon: Gift, size: "md" },
  "Charity":              { icon: HeartHandshake, size: "sm" },
  "Child Birth Expenses": { icon: Baby, size: "sm" },
  "Big Purchases":        { icon: ShoppingBag, size: "md" },
  "Estate For Children":  { icon: Landmark, size: "lg" },
};

const formatINRShort = (val) => {
  const n = parseFloat(val);
  if (!n || isNaN(n)) return null;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(1)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
};

export default function Step4LifestyleGoals() {
  const {
    activeGoals,
    addGoal,
    removeGoal,
    updateGoal,
    childrenCount,
    submitStep4,
    prevStep,
    isSubmitting,
  } = useAssessment();

  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);

  const goalCategories = Object.keys(GOAL_META);

  const customGoals = activeGoals.filter(
    (g) => g.type === "Other" || g.type === "Others" || (!goalCategories.includes(g.type) && g.type)
  );

  const handleGoalInputChange = (id, field, value) => updateGoal(id, { [field]: value });

  const openTripModal = (goalId) => {
    setSelectedGoalId(goalId);
    setIsTripModalOpen(true);
  };

  const isValid = validateStep4(activeGoals);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section */}
      <div className="border-b border-zinc-100 pb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#2B7FFF] shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 leading-tight">Lifestyle Goals</h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Select life milestone goals to include in the wealth plan (all optional).
            </p>
          </div>
        </div>

        {/* Active count badge */}
        {activeGoals.length > 0 && (
          <div className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold text-[#2B7FFF] bg-indigo-50 border border-indigo-100 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#2B7FFF] animate-pulse" />
            {activeGoals.length} Goal{activeGoals.length > 1 ? "s" : ""} Active
          </div>
        )}
      </div>

      {/* Bento Grid: Goal Category Picker (NO EMOJIS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
            Goal Categories
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">Click to add goal</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {goalCategories.map((catName) => {
            const meta = GOAL_META[catName] || { icon: Milestone, size: "md" };
            const IconComponent = meta.icon;
            const activeCount = activeGoals.filter((g) => g.type === catName).length;
            const isActive = activeCount > 0;

            return (
              <button
                key={catName}
                type="button"
                onClick={() => addGoal(catName)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isActive
                    ? "bg-indigo-50/80 border-[#2B7FFF] text-[#2B7FFF] shadow-2xs font-bold"
                    : "bg-zinc-50/70 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <div className={`p-2 rounded-xl border ${isActive ? 'bg-white border-indigo-200 text-[#2B7FFF]' : 'bg-white border-zinc-200 text-zinc-400'}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  {isActive ? (
                    <span className="w-5 h-5 rounded-full bg-[#2B7FFF] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">
                      {activeCount}
                    </span>
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  )}
                </div>
                <span className={`text-[11px] leading-tight font-extrabold ${isActive ? "text-[#2B7FFF]" : "text-zinc-800"}`}>
                  {catName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Goals Configuration */}
      <div className="space-y-3 pt-4 border-t border-zinc-100">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider select-none">
            Selected Goals Configuration
          </span>
          <button
            type="button"
            onClick={() => setIsCustomModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2B7FFF] cursor-pointer rounded-xl px-3 py-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100/70 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5" /> Add Custom Goal
          </button>
        </div>

        {activeGoals.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-zinc-50/50 border border-zinc-200/80 border-dashed space-y-1">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto mb-2">
              <Target className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-zinc-600">No goals selected yet</p>
            <p className="text-[11px] text-zinc-400">Select categories above or add a custom goal to configure.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Category Goals */}
            {goalCategories.map((catName) => {
              const categoryInstances = activeGoals.filter((g) => g.type === catName);
              if (categoryInstances.length === 0) return null;
              const meta = GOAL_META[catName] || { icon: Milestone };
              const IconComponent = meta.icon;

              return (
                <div key={catName} className="space-y-2.5">
                  {categoryInstances.map((goal, idx) => (
                    <div
                      key={goal.id}
                      className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 flex flex-col md:flex-row md:items-center gap-4 text-xs animate-fade-in"
                    >
                      <div className="font-extrabold text-zinc-800 md:w-48 shrink-0 flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-white border border-zinc-200 text-[#2B7FFF] shadow-2xs">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="truncate block font-bold text-zinc-900">
                            {catName}{categoryInstances.length > 1 ? ` #${idx + 1}` : ""}
                          </span>
                          {goal.targetYear && goal.todaysCost && (
                            <span className="text-[10px] text-[#2B7FFF] font-bold">
                              {formatINRShort(goal.todaysCost)} · {goal.targetYear}
                            </span>
                          )}
                        </div>
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

                      {catName === "Foreign Tour" && (
                        <button
                          type="button"
                          onClick={() => openTripModal(goal.id)}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#2B7FFF] border border-indigo-200 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs"
                        >
                          <Compass className="w-4 h-4" /> Plan Trip
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => removeGoal(goal.id)}
                        className="p-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer transition-colors self-end md:self-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(catName === "Foreign Tour" || catName === "Big Purchases") && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => addGoal(catName)}
                        className="text-xs font-bold text-[#2B7FFF] hover:underline cursor-pointer flex items-center gap-1 inline-flex"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add another {catName}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Custom Goals */}
            {customGoals.map((goal, idx) => (
              <div key={goal.id} className="bg-zinc-50/70 p-4 rounded-2xl border border-zinc-200/80 flex flex-col md:flex-row md:items-center gap-4 text-xs animate-fade-in">
                <div className="font-extrabold text-zinc-800 md:w-48 shrink-0 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="truncate font-bold text-zinc-900">
                    {goal.goalName || goal.name || `Custom Goal #${idx + 1}`}
                  </span>
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <FormField
                    label="Goal Name"
                    name={`custom-name-${goal.id}`}
                    value={goal.goalName || ""}
                    onChange={(e) => handleGoalInputChange(goal.id, "goalName", e.target.value)}
                    placeholder="e.g. World Cup"
                    required={false}
                  />
                  <FormField
                    label="Target Year (YYYY)"
                    name={`goal-year-${goal.id}`}
                    value={goal.targetYear || ""}
                    onChange={(e) => handleGoalInputChange(goal.id, "targetYear", e.target.value)}
                    placeholder="e.g. 2038"
                    type="number"
                    required={false}
                  />
                  <FormField
                    label="Today's Cost (INR)"
                    name={`goal-cost-${goal.id}`}
                    value={goal.todaysCost || ""}
                    onChange={(e) => handleGoalInputChange(goal.id, "todaysCost", e.target.value)}
                    placeholder="e.g. 500000"
                    type="number"
                    required={false}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeGoal(goal.id)}
                  className="p-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer transition-colors self-end md:self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-4 border-t border-zinc-100">
        <StepNavigation
          onBack={prevStep}
          onNext={submitStep4}
          isDisabled={!isValid}
          isLoading={isSubmitting}
        />
      </div>

      {/* Modals */}
      <TripPlanModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        goal={activeGoals.find((g) => g.id === selectedGoalId)}
        childrenCount={childrenCount}
        onSave={(data) => {
          updateGoal(selectedGoalId, data);
          setIsTripModalOpen(false);
        }}
      />

      <CustomGoalModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddGoal={(customData) => {
          addGoal("Other", customData);
        }}
      />
    </div>
  );
}
