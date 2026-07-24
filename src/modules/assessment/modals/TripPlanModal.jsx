import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../config/api';
import { FloatingDropdownModal } from '../../../components/UI/FloatingDropdownModal';
import { Compass, X, MapPin, Globe, Calendar, DollarSign, Check, Sparkles, SlidersHorizontal, User, ArrowRight } from 'lucide-react';

const formatINR = (value) => {
  if (!Number.isFinite(value) || value === 0) return null;
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000)   return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

const ChevronDown = ({ open }) => (
  <svg className={`w-4 h-4 text-[#2B7FFF] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export function TripPlanModal({ isOpen, onClose, onSave, goal, childrenCount }) {
  const [tripPlanningType, setTripPlanningType] = useState('destinations');
  const [tripSelectedDestinations, setTripSelectedDestinations] = useState([]);
  const [tripTargetYear, setTripTargetYear] = useState('');
  const [tripBudgetPerPerson, setTripBudgetPerPerson] = useState('');

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [catOpen, setCatOpen] = useState(false);

  const [destinationsList, setDestinationsList] = useState([]);
  const [destOpen, setDestOpen] = useState(false);

  const [budgetOptions, setBudgetOptions] = useState([]);
  const [loadingBudgetOptions, setLoadingBudgetOptions] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [projectedCost, setProjectedCost] = useState(null);
  const [addingId, setAddingId] = useState(null);

  const familySize = 2 + (childrenCount || 0);

  const getTourOptions = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return response?.data?.items || [];
  };

  const toDestination = (item, fallbackId) => {
    const value = item.budget_inr ?? item.cost ?? item.price;
    return {
      id: item.id || item.destination_id || item.uuid || item.slug || fallbackId,
      name: item.country || item.name || item.destination_name || item.title || '',
      cost: value == null || value === '' ? null : Number(value),
      famousFor: item.famous_for || item.country_famous_for || '',
      category: item.category || '',
      bestSeason: item.best_season || '',
    };
  };

  useEffect(() => {
    if (isOpen) {
      api.get('/tour/categories').then(res => {
        if (res.data?.categories) setCategories(res.data.categories);
        else if (res.data?.data?.categories) setCategories(res.data.data.categories);
        else if (Array.isArray(res.categories)) setCategories(res.categories);
      }).catch(console.error);
    }
  }, [isOpen]);

  useEffect(() => {
    if (goal) {
      setTripTargetYear(goal.targetYear || '');
      setTripSelectedDestinations([]);
      setTripPlanningType('destinations');
      const existingBudget = goal.todaysCost ? Math.round(parseFloat(goal.todaysCost) / familySize) : '';
      setTripBudgetPerPerson(existingBudget);
      setSaveError('');
      setSelectedCategory('');
      setDestOpen(false);
    }
  }, [goal, isOpen, familySize]);

  useEffect(() => {
    if (!isOpen) return;
    const url = `/tour/destinations?per_page=1000${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`;
    api.get(url)
      .then(res => {
        const list = getTourOptions(res);
        setDestinationsList(
          list
            .map((item, i) => toDestination(item, `dest-${i}`))
            .filter((d) => d.name)
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      })
      .catch(err => console.error('Failed to load destinations:', err));
  }, [isOpen, selectedCategory]);

  useEffect(() => {
    if (!isOpen || !tripBudgetPerPerson || tripPlanningType !== 'budget') {
      setBudgetOptions([]);
      return;
    }
    const t = setTimeout(() => {
      setLoadingBudgetOptions(true);
      const url = `/tour/destinations-for-budget?budget=${encodeURIComponent(tripBudgetPerPerson)}&per_page=5${selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`;
      api.get(url)
        .then(res => {
          const list = getTourOptions(res);
          setBudgetOptions(list.slice(0, 5).map((item, i) => toDestination(item, `bdest-${i}`)));
        })
        .catch(err => console.error('Budget search failed:', err))
        .finally(() => setLoadingBudgetOptions(false));
    }, 350);
    return () => clearTimeout(t);
  }, [tripBudgetPerPerson, tripPlanningType, isOpen, selectedCategory]);

  useEffect(() => {
    if (tripSelectedDestinations.length > 0 && tripTargetYear && isOpen) {
      api.post('/tour/project-cost', {
        destination_id: tripSelectedDestinations[0].id,
        target_year: Number(tripTargetYear),
        travellers: familySize
      }).then(res => setProjectedCost(res.data?.data || res.data || res))
        .catch(() => setProjectedCost(null));
    } else {
      setProjectedCost(null);
    }
  }, [tripSelectedDestinations, tripTargetYear, familySize, isOpen]);

  const selectDestination = (destination) => {
    if (tripSelectedDestinations.some(s => s.id === destination.id)) return;
    setSaveError('');
    setDestOpen(false);
    setAddingId(destination.id);
    setTimeout(() => setAddingId(null), 700);
    setTripSelectedDestinations(prev => [...prev, destination]);
    if (Number.isFinite(destination.cost)) setTripBudgetPerPerson(String(destination.cost));
  };

  const removeDestination = (id) => {
    setSaveError('');
    setTripSelectedDestinations(prev => prev.filter(d => d.id !== id));
  };

  const getProjectedValue = () => {
    if (!projectedCost) return null;
    const raw = projectedCost.future_cost?.raw ?? projectedCost.future_cost ?? projectedCost.projected_cost ?? projectedCost.total_cost;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const getSIPValue = () => {
    if (!projectedCost) return null;
    const raw = projectedCost.monthly_sip?.raw ?? projectedCost.monthly_sip ?? projectedCost.sip;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const getTodaysCost = () => {
    if (tripPlanningType === 'destinations' && tripSelectedDestinations.length > 0) {
      const costs = tripSelectedDestinations
        .map((d) => d.cost)
        .filter((c) => Number.isFinite(c) && c > 0);
      if (costs.length !== tripSelectedDestinations.length) return null;
      return Math.round((costs.reduce((t, c) => t + c, 0) / costs.length) * familySize);
    }
    const n = Number(tripBudgetPerPerson);
    return Number.isFinite(n) && n > 0 ? Math.round(n * familySize) : null;
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const cost = getTodaysCost();
    if (cost === null) {
      setSaveError(
        tripSelectedDestinations.length
          ? 'Could not retrieve destination budget. Try again.'
          : 'Select a destination or enter a budget first.'
      );
      return;
    }
    onSave({ targetYear: tripTargetYear || String(new Date().getFullYear() + 5), todaysCost: String(cost) });
  };

  if (!isOpen) return null;

  const todaysCost = getTodaysCost();
  const projVal = getProjectedValue();
  const sipVal = getSIPValue();

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
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-zinc-900 leading-tight">
              Foreign Tour Planning
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Configure vacation parameters for {familySize} travellers
            </p>
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

      {/* 100% Full-Screen Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-thin bg-zinc-50/50">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Top Control Bar: Mode Switcher & Category Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Mode Switcher (7 cols) */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3">
              {[
                { key: 'destinations', label: 'Pick Destinations', sub: 'Browse & pick countries', icon: Globe },
                { key: 'budget', label: 'Set a Budget', sub: 'Filter top matches by budget', icon: DollarSign },
              ].map(({ key, label, sub, icon: Icon }) => {
                const active = tripPlanningType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTripPlanningType(key)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3.5 ${
                      active
                        ? 'bg-white border-[#2B7FFF] text-[#2B7FFF] shadow-md ring-2 ring-[#2B7FFF]/20'
                        : 'bg-white/80 border-zinc-200 text-zinc-600 hover:bg-white hover:border-zinc-300 shadow-2xs'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl border ${active ? 'bg-indigo-50 border-indigo-200 text-[#2B7FFF]' : 'bg-zinc-50 border-zinc-200 text-zinc-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-black">{label}</div>
                      <div className="text-[11px] text-zinc-400 font-medium mt-0.5">{sub}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Category Dropdown Filter (5 cols) */}
            <div className="md:col-span-5">
              <label className="block text-xs font-bold text-zinc-700 mb-1.5 select-none flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-[#2B7FFF]" /> Travel Category Filter
              </label>
              <button
                type="button"
                onClick={() => setCatOpen(true)}
                className="w-full text-xs sm:text-sm bg-white border border-zinc-200 rounded-2xl px-4 py-3 outline-none flex justify-between items-center cursor-pointer hover:border-[#2B7FFF] font-semibold shadow-2xs"
              >
                <span className={selectedCategory ? 'text-zinc-900' : 'text-zinc-400'}>
                  {selectedCategory || 'All Travel Categories'}
                </span>
                <ChevronDown open={catOpen} />
              </button>
              <FloatingDropdownModal
                isOpen={catOpen}
                onClose={() => setCatOpen(false)}
                title="Select Travel Category"
                subtitle="Filter destinations by trip theme"
                placeholder="Search category..."
                selectedValue={selectedCategory}
                onSelect={(opt) => setSelectedCategory(opt.value)}
                options={[
                  { label: 'All Categories', value: '', subtext: 'View all tour destinations', icon: <Globe className="w-4 h-4" /> },
                  ...categories.map((c) => ({
                    label: c,
                    value: c,
                    subtext: `${c} packages`,
                    icon: <Compass className="w-4 h-4" />,
                  })),
                ]}
              />
            </div>
          </div>

          {/* 2-Column Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (7 cols): Destination Search or Budget Input */}
            <div className="lg:col-span-7 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-2xs">
              {tripPlanningType === 'destinations' ? (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-zinc-800 select-none flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#2B7FFF]" /> Search & Select Destination
                  </label>
                  <button
                    type="button"
                    onClick={() => setDestOpen(true)}
                    className="w-full text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 outline-none flex items-center justify-between gap-3 text-left cursor-pointer hover:border-[#2B7FFF] hover:bg-white font-medium shadow-2xs"
                  >
                    <span className="truncate text-zinc-400">Type country name or landmark...</span>
                    <ChevronDown open={destOpen} />
                  </button>

                  <FloatingDropdownModal
                    isOpen={destOpen}
                    onClose={() => setDestOpen(false)}
                    title="Select Tour Destinations"
                    subtitle="Search countries and estimated per-person budgets"
                    placeholder="Type destination..."
                    emptyMessage="No destinations found."
                    onSelect={(opt) => selectDestination(opt.raw)}
                    options={destinationsList.map((d) => ({
                      id: d.id,
                      label: d.name,
                      subtext: [d.famousFor, d.category, d.bestSeason ? `🗓 ${d.bestSeason}` : null].filter(Boolean).join(' · '),
                      rightTag: Number.isFinite(d.cost) ? `${formatINR(d.cost)} /pp` : null,
                      disabled: tripSelectedDestinations.some((item) => item.id === d.id),
                      raw: d,
                      icon: <MapPin className="w-4 h-4 text-[#2B7FFF]" />,
                    }))}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-zinc-800 select-none">
                    Budget Per Person (INR)
                  </label>
                  <input
                    type="number"
                    value={tripBudgetPerPerson}
                    onChange={(e) => {
                      setSaveError('');
                      setTripBudgetPerPerson(e.target.value);
                    }}
                    placeholder="e.g. 380000"
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-semibold shadow-2xs"
                  />

                  {tripBudgetPerPerson && (
                    <div className="space-y-3 pt-2">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        {loadingBudgetOptions ? 'Searching...' : 'Top 5 Matching Destinations'}
                      </div>
                      {loadingBudgetOptions ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 rounded-2xl bg-zinc-100 animate-pulse" />
                          ))}
                        </div>
                      ) : budgetOptions.length > 0 ? (
                        <div className="space-y-2.5">
                          {budgetOptions.map((opt, idx) => {
                            const selected = tripSelectedDestinations.some((s) => s.id === opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  if (!selected) {
                                    setSaveError('');
                                    setAddingId(opt.id);
                                    setTimeout(() => setAddingId(null), 700);
                                    setTripSelectedDestinations([opt]);
                                  }
                                }}
                                disabled={selected}
                                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                  selected
                                    ? 'bg-indigo-50/90 border-[#2B7FFF] shadow-xs cursor-default'
                                    : 'bg-zinc-50/60 border-zinc-200 hover:border-indigo-300 hover:bg-white cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${selected ? 'bg-[#2B7FFF] text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                                    {selected ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-zinc-900">{opt.name}</div>
                                    <div className="text-[11px] text-zinc-400">{opt.famousFor || opt.category}</div>
                                  </div>
                                </div>
                                {Number.isFinite(opt.cost) && (
                                  <div className="text-xs font-bold text-[#2B7FFF]">{formatINR(opt.cost)}</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-400 italic py-2">No destinations matching budget.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (5 cols): Summary Card & Future Projection */}
            <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xs">
              <div className="space-y-5">
                <div className="text-xs font-black text-zinc-900 border-b border-zinc-200 pb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2B7FFF]" /> Trip Planning Summary
                </div>

                {/* Selected Chips */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-2 select-none">
                    Selected Destinations
                  </label>
                  {tripSelectedDestinations.length === 0 ? (
                    <div className="p-5 text-center text-xs text-zinc-400 border border-zinc-200 border-dashed rounded-2xl bg-zinc-50/50">
                      No destinations selected yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tripSelectedDestinations.map((dest) => (
                        <div
                          key={dest.id}
                          className="bg-indigo-50 border border-indigo-200 text-[#2B7FFF] rounded-2xl px-3.5 py-2 text-xs font-bold flex items-center gap-2 shadow-2xs"
                        >
                          <MapPin className="w-4 h-4" />
                          <span>{dest.name}</span>
                          {Number.isFinite(dest.cost) && (
                            <span className="text-[10px] text-zinc-500 font-semibold">{formatINR(dest.cost)}/pp</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeDestination(dest.id)}
                            className="hover:text-indigo-900 font-bold cursor-pointer ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Target Year */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 mb-1.5 select-none flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#2B7FFF]" /> Target Travel Year
                  </label>
                  <input
                    type="number"
                    value={tripTargetYear}
                    onChange={(e) => setTripTargetYear(e.target.value)}
                    placeholder="e.g. 2027"
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:border-[#2B7FFF] focus:bg-white font-semibold shadow-2xs"
                  />
                </div>

                {/* Total Travellers count */}
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200">
                  <span className="flex items-center gap-2 text-zinc-500 font-medium">
                    <User className="w-4 h-4 text-[#2B7FFF]" /> Total Travellers:
                  </span>
                  <span>{familySize} Person{familySize > 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Projected Future Cost */}
              {projVal ? (
                <div className="p-5 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-center space-y-1.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Projected Future Cost</p>
                  <p className="text-3xl font-black text-zinc-900">{formatINR(projVal)}</p>
                  {sipVal && (
                    <p className="text-xs font-semibold text-zinc-600">
                      Monthly SIP Needed: <span className="text-[#2B7FFF] font-bold">{formatINR(sipVal)}</span>
                    </p>
                  )}
                  <p className="text-xs font-medium text-[#2B7FFF]">For {familySize} travellers in {tripTargetYear}</p>
                </div>
              ) : (
                <div className="p-5 bg-zinc-50 border border-zinc-200 border-dashed rounded-2xl text-center text-xs text-zinc-400 font-medium">
                  Select a destination and enter target year to view cost estimation.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 100% Full-Screen Footer */}
      <div className="shrink-0 h-16 sm:h-20 px-6 sm:px-10 border-t border-zinc-200 bg-white flex items-center justify-between gap-4 z-10">
        <div className="text-xs sm:text-sm font-semibold text-zinc-700">
          {todaysCost ? (
            <span>Today&apos;s Total Cost: <span className="text-[#2B7FFF] font-black text-base ml-1">{formatINR(todaysCost)}</span></span>
          ) : saveError ? (
            <span className="text-rose-600 font-semibold">{saveError}</span>
          ) : (
            <span className="text-zinc-400">Fill in travel details to calculate.</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer bg-zinc-100 hover:bg-zinc-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#2B7FFF] hover:bg-[#2B7FFF]/90 text-white text-xs font-bold px-8 py-3 rounded-xl transition-all cursor-pointer shadow-md shadow-indigo-500/20 active:scale-[0.98] flex items-center gap-2"
          >
            Save Tour Goal <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
