import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Target, X, Sparkles, Plus } from 'lucide-react';

const formatINR = (val) => {
  const num = parseFloat(val);
  if (isNaN(num) || num <= 0) return null;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakhs`;
  return `₹${num.toLocaleString('en-IN')}`;
};

const PRESETS = [
  'World Cup Trip',
  'Luxury Watch',
  'Farm House',
  'Art Collection',
  'Sailing Trip',
  'Start Business',
];

export function CustomGoalModal({ isOpen, onClose, onAddGoal }) {
  const [goalName, setGoalName] = useState('');
  const [targetYear, setTargetYear] = useState('');
  const [todaysCost, setTodaysCost] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGoalName('');
      setTargetYear('');
      setTodaysCost('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentYear = new Date().getFullYear();

  const handlePresetClick = (presetName) => {
    setGoalName(presetName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddGoal({
      goalName: goalName.trim() || 'Custom Goal',
      targetYear: targetYear.toString().trim(),
      todaysCost: todaysCost.toString().trim(),
    });
    onClose();
  };

  const formattedCost = formatINR(todaysCost);

  const modalJSX = (
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen bg-white flex flex-col overflow-hidden select-none animate-fade-in text-zinc-800"
      aria-modal="true"
      role="dialog"
    >
      {/* 100% Full-Screen Header */}
      <div className="shrink-0 h-16 sm:h-20 px-6 sm:px-10 border-b border-zinc-200 bg-white flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#2B7FFF] shrink-0 shadow-2xs">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-zinc-900 leading-tight">
              Add Custom Lifestyle Goal
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Specify custom milestone parameters</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close panel"
          className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer outline-none shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 100% Full-Screen Scrollable Content */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 bg-zinc-50/50 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-thin">
          <div className="max-w-3xl mx-auto space-y-8 bg-white p-6 sm:p-10 rounded-3xl border border-zinc-200/80 shadow-2xs">
            {/* Quick Suggestions */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-3 select-none flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2B7FFF]" /> Quick Suggestions
              </label>
              <div className="flex flex-wrap gap-2.5">
                {PRESETS.map((preset) => {
                  const isSelected = goalName === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetClick(preset)}
                      className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-2xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#2B7FFF] text-white border-[#2B7FFF] shadow-xs'
                          : 'bg-zinc-50 border-zinc-200/80 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                      }`}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal Name Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-800 select-none">
                Goal Name
              </label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. World Cup Trip, Luxury Watch"
                className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-semibold shadow-2xs"
                autoFocus
              />
            </div>

            {/* Target Year & Today's Cost Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Target Year */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800 select-none">
                  Target Year (YYYY)
                </label>
                <input
                  type="number"
                  value={targetYear}
                  onChange={(e) => setTargetYear(e.target.value)}
                  placeholder={`e.g. ${currentYear + 5}`}
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-semibold shadow-2xs"
                />
              </div>

              {/* Today's Cost */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800 select-none">
                  Today's Cost (INR)
                </label>
                <input
                  type="number"
                  value={todaysCost}
                  onChange={(e) => setTodaysCost(e.target.value)}
                  placeholder="e.g. 500000"
                  className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-semibold shadow-2xs"
                />
                {formattedCost && (
                  <span className="text-xs text-[#2B7FFF] font-extrabold block mt-1">
                    {formattedCost}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 100% Full-Screen Footer */}
        <div className="shrink-0 h-16 sm:h-20 px-6 sm:px-10 border-t border-zinc-200 bg-white flex items-center justify-end gap-4 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer bg-zinc-100 hover:bg-zinc-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 text-white text-xs font-bold px-8 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/20 active:scale-[0.98] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Custom Goal
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
