import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import api from '../../../config/api';
import { FloatingDropdownModal } from '../../../components/UI/FloatingDropdownModal';
import { GraduationCap, X, Building, Globe, Calendar, DollarSign, Check, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

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

export function EducationPlanModal({ isOpen, onClose, onSave, child }) {
  const [modalPlanningType, setModalPlanningType] = useState('college');
  const [modalSelectedColleges, setModalSelectedColleges] = useState([]);
  const [modalIncludeForeign, setModalIncludeForeign] = useState(false);
  const [modalTargetYear, setModalTargetYear] = useState('');
  const [modalBudgetAmount, setModalBudgetAmount] = useState('');

  const userTypedBudget = useRef(false);
  const [addingId, setAddingId] = useState(null);

  const [courseCategories, setCourseCategories] = useState([]);
  const [countries, setCountries] = useState([]);
  const [selectedCourseCategory, setSelectedCourseCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');

  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [collegeDropdownOpen, setCollegeDropdownOpen] = useState(false);

  const [collegesList, setCollegesList] = useState([]);
  const [budgetOptions, setBudgetOptions] = useState([]);
  const [loadingBudgetOptions, setLoadingBudgetOptions] = useState(false);
  const [projectedCost, setProjectedCost] = useState(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/education/categories')
        .then(res => {
          const data = res.data || res;
          const catData = data.data || data;
          if (catData) {
            setCourseCategories(catData.course_categories || []);
            setCountries(catData.countries || []);
          }
        })
        .catch(err => console.error('Failed to load education categories:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (child) {
      setModalTargetYear(child.targetYear || '');
      setModalSelectedColleges([]);
      setModalIncludeForeign(false);
      setModalPlanningType('college');
      setModalBudgetAmount(child.todaysCost || '');
      setSaveError('');
      setSelectedCourseCategory('');
      setSelectedCountry('');
      userTypedBudget.current = false;
    }
  }, [child, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let url = '/education/programs?per_page=200';
    if (selectedCourseCategory) url += `&course_category=${encodeURIComponent(selectedCourseCategory)}`;
    if (selectedCountry) url += `&country=${encodeURIComponent(selectedCountry)}`;
    api.get(url)
      .then(res => {
        const payload = res?.data ?? res;
        const rawList =
          Array.isArray(payload) ? payload :
          Array.isArray(payload?.items) ? payload.items :
          Array.isArray(payload?.programs) ? payload.programs :
          Array.isArray(payload?.results) ? payload.results :
          [];

        const mapped = rawList.map((item, i) => ({
          id: item.id || `prog-${i}`,
          name: item.display_name || item.institution_name || item.name || '',
          cost: item.approx_cost_inr ?? item.cost ?? item.budget_inr ?? 0,
          country: (item.country || '').trim(),
          level: item.level || '',
          category: (item.course_category || item.category || '').trim(),
          duration: item.duration || '',
        }));

        const filtered = mapped.filter(item => {
          const catMatch = !selectedCourseCategory ||
            item.category.toLowerCase() === selectedCourseCategory.toLowerCase() ||
            item.category.toLowerCase().includes(selectedCourseCategory.toLowerCase());

          const countryMatch = !selectedCountry ||
            item.country.toLowerCase() === selectedCountry.toLowerCase() ||
            item.country.toLowerCase().includes(selectedCountry.toLowerCase());

          const foreignMatch = modalIncludeForeign ||
            item.country.toLowerCase() === 'india' ||
            item.country === '';

          return catMatch && countryMatch && foreignMatch;
        });

        setCollegesList(filtered);
      })
      .catch(err => console.error('Failed to load programs:', err));
  }, [isOpen, selectedCourseCategory, selectedCountry, modalIncludeForeign]);

  useEffect(() => {
    if (!isOpen || !modalBudgetAmount || modalPlanningType !== 'budget') {
      setBudgetOptions([]);
      return;
    }
    const budget = Number(modalBudgetAmount);
    if (!Number.isFinite(budget) || budget <= 0) { setBudgetOptions([]); return; }

    setBudgetOptions([]);
    setLoadingBudgetOptions(true);

    const t = setTimeout(() => {
      let url = `/education/programs?per_page=200`;
      if (selectedCourseCategory) url += `&course_category=${encodeURIComponent(selectedCourseCategory)}`;
      if (selectedCountry) url += `&country=${encodeURIComponent(selectedCountry)}`;

      api.get(url)
        .then(res => {
          const payload = res?.data ?? res;
          const rawList =
            Array.isArray(payload) ? payload :
            Array.isArray(payload?.items) ? payload.items :
            Array.isArray(payload?.programs) ? payload.programs :
            Array.isArray(payload?.results) ? payload.results :
            [];

          const mapped = rawList.map((item, i) => ({
            id: item.id || `bprog-${i}`,
            name: item.display_name || item.institution_name || item.name || '',
            cost: item.approx_cost_inr ?? item.cost ?? item.budget_inr ?? 0,
            country: (item.country || '').trim(),
            level: item.level || '',
            category: (item.course_category || item.category || '').trim(),
            duration: item.duration || '',
          }));

          const filtered = mapped.filter(item => {
            const catMatch = !selectedCourseCategory ||
              item.category.toLowerCase() === selectedCourseCategory.toLowerCase() ||
              item.category.toLowerCase().includes(selectedCourseCategory.toLowerCase());
            const countryMatch = !selectedCountry ||
              item.country.toLowerCase() === selectedCountry.toLowerCase() ||
              item.country.toLowerCase().includes(selectedCountry.toLowerCase());
            return catMatch && countryMatch;
          });

          const sorted = filtered
            .filter(item => Number.isFinite(item.cost) && item.cost > 0)
            .sort((a, b) => Math.abs(a.cost - budget) - Math.abs(b.cost - budget));

          setBudgetOptions(sorted.slice(0, 5));
        })
        .catch(err => console.error('Budget search failed:', err))
        .finally(() => setLoadingBudgetOptions(false));
    }, 400);
    return () => clearTimeout(t);
  }, [modalBudgetAmount, modalPlanningType, isOpen, selectedCourseCategory, selectedCountry]);

  useEffect(() => {
    if (modalSelectedColleges.length > 0 && modalTargetYear && isOpen) {
      api.post('/education/project-cost', {
        program_id: modalSelectedColleges[0].id,
        target_year: Number(modalTargetYear)
      }).then(res => {
        const d = res.data?.data || res.data || res;
        if (d) setProjectedCost(d);
      }).catch(err => {
        console.error('Failed to project cost:', err);
        setProjectedCost(null);
      });
    } else {
      setProjectedCost(null);
    }
  }, [modalSelectedColleges, modalTargetYear, isOpen]);

  const selectCollege = (college) => {
    if (modalSelectedColleges.some(s => s.id === college.id)) return;
    setSaveError('');
    setAddingId(college.id);
    setTimeout(() => setAddingId(null), 700);
    setModalSelectedColleges(prev => [...prev, college]);
    if (Number.isFinite(college.cost)) {
      userTypedBudget.current = false;
      setModalBudgetAmount(String(college.cost));
    }
    setCollegeDropdownOpen(false);
  };

  const selectMatchingCollege = (college) => {
    setSaveError('');
    setAddingId(college.id);
    setTimeout(() => setAddingId(null), 700);
    setModalSelectedColleges([college]);
  };

  const removeCollege = (id) => {
    setModalSelectedColleges(prev => {
      const updated = prev.filter(c => c.id !== id);
      if (!userTypedBudget.current) {
        if (updated.length > 0) {
          const total = updated.reduce((t, c) => t + c.cost, 0);
          setModalBudgetAmount(String(Math.round(total / updated.length)));
        } else {
          setModalBudgetAmount('');
        }
      }
      return updated;
    });
  };

  const getProjectedValue = () => {
    if (!projectedCost) return null;
    const raw = projectedCost.future_cost?.raw ?? projectedCost.future_cost ?? projectedCost.projected_cost;
    return Number.isFinite(Number(raw)) && Number(raw) > 0 ? Number(raw) : null;
  };

  const getSIPValue = () => {
    if (!projectedCost) return null;
    const raw = projectedCost.monthly_sip?.raw ?? projectedCost.monthly_sip;
    return Number.isFinite(Number(raw)) && Number(raw) > 0 ? Number(raw) : null;
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const enteredBudget = Number(modalBudgetAmount);
    let calculatedCost = null;
    if (userTypedBudget.current && Number.isFinite(enteredBudget) && enteredBudget > 0) {
      calculatedCost = enteredBudget;
    } else if (Number.isFinite(enteredBudget) && enteredBudget > 0 && modalSelectedColleges.length === 0) {
      calculatedCost = enteredBudget;
    } else if (modalSelectedColleges.length > 0) {
      const allValid = modalSelectedColleges.every(c => Number.isFinite(c.cost));
      if (!allValid) { setSaveError('Could not retrieve budget for selected college.'); return; }
      const total = modalSelectedColleges.reduce((t, c) => t + c.cost, 0);
      calculatedCost = Math.round(total / modalSelectedColleges.length);
    } else {
      setSaveError('Select a college or enter a budget before saving.');
      return;
    }
    onSave({ goalType: 'Higher Education', targetYear: modalTargetYear || String(new Date().getFullYear() + 10), todaysCost: String(calculatedCost) });
  };

  if (!isOpen) return null;

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
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-black text-zinc-900 leading-tight">
              Child Education Planning
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Plan higher education target budget & dream colleges
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

          {/* Mode Switcher */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {[
              { key: 'college', label: 'Dream College', sub: 'Select colleges for cost estimate', icon: Building },
              { key: 'budget', label: 'Set a Budget', sub: 'Filter top matching programs', icon: DollarSign },
            ].map(({ key, label, sub, icon: Icon }) => {
              const active = modalPlanningType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setModalPlanningType(key)}
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

          {/* 2-Column Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (7 cols): Filters & College / Budget Search */}
            <div className="lg:col-span-7 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-zinc-200/80 shadow-2xs">
              {/* Category & Country filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course Category */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5 select-none flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#2B7FFF]" /> Course Category
                  </label>
                  <button
                    type="button"
                    onClick={() => setCatDropdownOpen(true)}
                    className="w-full text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none flex justify-between items-center cursor-pointer hover:border-[#2B7FFF] hover:bg-white font-medium shadow-2xs"
                  >
                    <span className={selectedCourseCategory ? 'text-zinc-900 truncate' : 'text-zinc-400 truncate'}>
                      {selectedCourseCategory || 'All Categories'}
                    </span>
                    <ChevronDown open={catDropdownOpen} />
                  </button>
                  <FloatingDropdownModal
                    isOpen={catDropdownOpen}
                    onClose={() => setCatDropdownOpen(false)}
                    title="Select Course Category"
                    subtitle="Filter programs by stream or degree"
                    placeholder="Search category..."
                    selectedValue={selectedCourseCategory}
                    onSelect={(opt) => setSelectedCourseCategory(opt.value)}
                    options={[
                      { label: 'All Categories', value: '', subtext: 'View all programs', icon: <BookOpen className="w-4 h-4" /> },
                      ...courseCategories.map((c) => ({ label: c, value: c, subtext: `${c} degree programs`, icon: <GraduationCap className="w-4 h-4" /> })),
                    ]}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5 select-none flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#2B7FFF]" /> Country
                  </label>
                  <button
                    type="button"
                    onClick={() => setCountryDropdownOpen(true)}
                    className="w-full text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none flex justify-between items-center cursor-pointer hover:border-[#2B7FFF] hover:bg-white font-medium shadow-2xs"
                  >
                    <span className={selectedCountry ? 'text-zinc-900 truncate' : 'text-zinc-400 truncate'}>
                      {selectedCountry || 'All Countries'}
                    </span>
                    <ChevronDown open={countryDropdownOpen} />
                  </button>
                  <FloatingDropdownModal
                    isOpen={countryDropdownOpen}
                    onClose={() => setCountryDropdownOpen(false)}
                    title="Select Country"
                    subtitle="Filter programs by study location"
                    placeholder="Search country..."
                    selectedValue={selectedCountry}
                    onSelect={(opt) => setSelectedCountry(opt.value)}
                    options={[
                      { label: 'All Countries', value: '', subtext: 'Global institutions', icon: <Globe className="w-4 h-4" /> },
                      ...countries.map((c) => ({ label: c, value: c, subtext: `Institutions in ${c}`, icon: <Building className="w-4 h-4" /> })),
                    ]}
                  />
                </div>
              </div>

              {/* Mode-specific search inputs */}
              {modalPlanningType === 'college' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1.5 select-none flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#2B7FFF]" /> Select Dream College
                    </label>
                    <button
                      type="button"
                      onClick={() => setCollegeDropdownOpen(true)}
                      className="w-full text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 outline-none flex justify-between items-center cursor-pointer hover:border-[#2B7FFF] hover:bg-white font-medium shadow-2xs"
                    >
                      <span className="text-zinc-400">Search colleges or universities...</span>
                      <ChevronDown open={collegeDropdownOpen} />
                    </button>
                    <FloatingDropdownModal
                      isOpen={collegeDropdownOpen}
                      onClose={() => setCollegeDropdownOpen(false)}
                      title="Select Dream College"
                      subtitle="Browse top institutions and estimated course budgets"
                      placeholder="Type college name, country or degree..."
                      emptyMessage="No colleges found."
                      onSelect={(opt) => selectCollege(opt.raw)}
                      options={collegesList.map((c) => ({
                        id: c.id,
                        label: c.name,
                        subtext: [c.level, c.country].filter(Boolean).join(' · '),
                        rightTag: Number.isFinite(c.cost) && c.cost > 0 ? formatINR(c.cost) : null,
                        disabled: modalSelectedColleges.some((s) => s.id === c.id),
                        raw: c,
                        icon: <Building className="w-4 h-4 text-[#2B7FFF]" />,
                      }))}
                    />
                  </div>

                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={modalIncludeForeign}
                      onChange={(e) => setModalIncludeForeign(e.target.checked)}
                      className="rounded text-[#2B7FFF] focus:ring-0 cursor-pointer w-4 h-4"
                    />
                    <span className="text-xs font-bold text-zinc-700">Include Foreign Colleges</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1.5 select-none">
                      Education Budget (Today's Value)
                    </label>
                    <input
                      type="number"
                      value={modalBudgetAmount}
                      onChange={(e) => {
                        setSaveError('');
                        userTypedBudget.current = true;
                        setModalBudgetAmount(e.target.value);
                      }}
                      placeholder="e.g. 1500000"
                      onWheel={(e) => e.currentTarget.blur()}
                      className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 outline-none focus:border-[#2B7FFF] focus:bg-white font-semibold shadow-2xs"
                    />
                  </div>

                  {modalBudgetAmount && (
                    <div className="space-y-3 pt-1">
                      <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                        {loadingBudgetOptions ? 'Searching...' : 'Top 5 Matching Programs'}
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
                            const isSelected = modalSelectedColleges.some((c) => c.id === opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => selectMatchingCollege(opt)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                                  isSelected
                                    ? 'border-[#2B7FFF] bg-indigo-50/80 shadow-2xs'
                                    : 'border-zinc-200 bg-zinc-50/60 hover:bg-white hover:border-zinc-300 cursor-pointer'
                                }`}
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-[#2B7FFF] text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                                  {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-zinc-800 truncate">{opt.name}</div>
                                  <div className="text-[10px] text-zinc-400">{[opt.level, opt.country].filter(Boolean).join(' · ')}</div>
                                </div>
                                {Number.isFinite(opt.cost) && opt.cost > 0 && (
                                  <div className="text-xs font-bold text-[#2B7FFF]">{formatINR(opt.cost)}</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-zinc-400 italic py-2">No programs matching budget.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (5 cols): Summary & Projection Card */}
            <div className="lg:col-span-5 bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-2xs">
              <div className="space-y-5">
                <div className="text-xs font-black text-zinc-900 border-b border-zinc-200 pb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2B7FFF]" /> Education Plan Summary
                </div>

                {/* Selected Colleges Chips */}
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-2 select-none">
                    Selected Institutions
                  </label>
                  {modalSelectedColleges.length === 0 ? (
                    <div className="p-5 text-center text-xs text-zinc-400 border border-zinc-200 border-dashed rounded-2xl bg-zinc-50/50">
                      No colleges selected yet.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {modalSelectedColleges.map((col) => (
                        <div
                          key={col.id}
                          className="bg-indigo-50 border border-indigo-200 text-[#2B7FFF] rounded-2xl px-3.5 py-2 text-xs font-bold flex items-center gap-2 shadow-2xs"
                        >
                          <Building className="w-4 h-4" />
                          <span>{col.name}</span>
                          {Number.isFinite(col.cost) && col.cost > 0 && (
                            <span className="text-[10px] text-zinc-500 font-semibold">{formatINR(col.cost)}</span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeCollege(col.id)}
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
                    <Calendar className="w-4 h-4 text-[#2B7FFF]" /> Target Admission Year
                  </label>
                  <input
                    type="number"
                    value={modalTargetYear}
                    onChange={(e) => setModalTargetYear(e.target.value)}
                    placeholder="e.g. 2035"
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full text-xs sm:text-sm bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:border-[#2B7FFF] focus:bg-white font-semibold shadow-2xs"
                  />
                </div>
              </div>

              {/* Projected Cost Card */}
              {projVal ? (
                <div className="p-5 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-center space-y-1.5 shadow-2xs">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Projected Future Cost</p>
                  <p className="text-3xl font-black text-zinc-900">{formatINR(projVal)}</p>
                  {sipVal && (
                    <p className="text-xs font-semibold text-zinc-600">
                      Required Monthly SIP: <span className="text-[#2B7FFF] font-bold">{formatINR(sipVal)}</span>
                    </p>
                  )}
                  <p className="text-xs font-medium text-[#2B7FFF]">For admission in {modalTargetYear}</p>
                </div>
              ) : (
                <div className="p-5 bg-zinc-50 border border-zinc-200 border-dashed rounded-2xl text-center text-xs text-zinc-400 font-medium">
                  Select a college or enter budget and target year to calculate future cost.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 100% Full-Screen Footer */}
      <div className="shrink-0 h-16 sm:h-20 px-6 sm:px-10 border-t border-zinc-200 bg-white flex items-center justify-between gap-4 z-10">
        <div className="text-xs sm:text-sm font-semibold text-zinc-700">
          {saveError && <span className="text-rose-600 font-semibold">{saveError}</span>}
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
            Save Education Goal <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
