import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, Check, Globe } from 'lucide-react';

export function FloatingDropdownModal({
  isOpen,
  onClose,
  title = 'Select Option',
  subtitle,
  placeholder = 'Search options...',
  options = [],
  selectedValue,
  onSelect,
  showSearch = true,
  emptyMessage = 'No options found',
  renderCustomItem,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Close on ESC key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus search input when opened & reset search query
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter options based on search query
  const filteredOptions = options.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const label = String(item.label || item.name || item.value || '').toLowerCase();
    const subtext = String(item.subtext || item.country || item.level || item.category || item.famousFor || '').toLowerCase();
    const rightTag = String(item.rightTag || item.cost || item.badge || '').toLowerCase();
    return label.includes(query) || subtext.includes(query) || rightTag.includes(query);
  });

  const handleSelect = (option) => {
    onSelect(option);
    onClose();
  };

  const modalJSX = (
    <div
      className="fixed inset-0 z-[9999] w-screen h-screen bg-white flex flex-col overflow-hidden select-none animate-fade-in text-zinc-800"
      aria-modal="true"
      role="dialog"
    >
      {/* Fixed Full-Screen Header */}
      <div className="shrink-0 h-16 sm:h-20 px-6 sm:px-10 border-b border-zinc-200 bg-white flex items-center justify-between gap-4 z-10">
        <div>
          <h3 className="text-base sm:text-xl font-black text-zinc-900 flex items-center gap-2">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-zinc-400 font-medium mt-0.5">{subtitle}</p>}
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

      {/* Full-Screen Search Bar */}
      {showSearch && (
        <div className="shrink-0 px-6 sm:px-10 py-4 bg-zinc-50 border-b border-zinc-200">
          <div className="max-w-4xl mx-auto relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-[#2B7FFF] pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full pl-12 pr-10 py-3 text-sm font-semibold bg-white border border-zinc-300 rounded-2xl outline-none focus:border-[#2B7FFF] focus:ring-2 focus:ring-[#2B7FFF]/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-4 text-xs font-bold text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Full-Width Grid Content (3-4 columns) */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-10 scrollbar-thin bg-zinc-50/50">
        <div className="max-w-7xl mx-auto">
          {filteredOptions.length === 0 ? (
            <div className="py-20 text-center text-sm text-zinc-400 italic font-medium">
              {emptyMessage}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredOptions.map((option, idx) => {
                const val = option.value !== undefined ? option.value : (option.id !== undefined ? option.id : option.label);
                const isSelected =
                  selectedValue !== undefined && selectedValue !== null &&
                  (selectedValue === val || selectedValue === option.label || (typeof selectedValue === 'object' && selectedValue?.id === option.id));

                if (renderCustomItem) {
                  return (
                    <div key={val || idx} onClick={() => !option.disabled && handleSelect(option)}>
                      {renderCustomItem(option, isSelected, idx)}
                    </div>
                  );
                }

                return (
                  <button
                    key={val || idx}
                    type="button"
                    disabled={option.disabled}
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-3 ${
                      option.disabled
                        ? 'opacity-40 cursor-not-allowed border-transparent bg-zinc-100'
                        : isSelected
                        ? 'bg-indigo-50/90 border-[#2B7FFF] text-[#2B7FFF] font-bold shadow-sm ring-2 ring-[#2B7FFF]/20'
                        : 'border-zinc-200 bg-white hover:bg-indigo-50/40 hover:border-indigo-300 text-zinc-800 cursor-pointer shadow-xs hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {option.icon ? (
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-2xs mt-0.5">
                          {option.icon}
                        </div>
                      ) : (
                        <div className="shrink-0 w-9 h-9 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-center text-[#2B7FFF] mt-0.5">
                          <Globe className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold truncate text-zinc-900">
                          {option.label || option.name}
                        </div>
                        {option.subtext && (
                          <div className="text-xs font-medium text-zinc-400 truncate mt-0.5">
                            {option.subtext}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-right">
                      {option.rightTag && (
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${isSelected ? 'bg-white text-[#2B7FFF] border-indigo-200' : 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
                          {option.rightTag}
                        </span>
                      )}
                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-[#2B7FFF] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Full-Screen Footer */}
      <div className="shrink-0 h-16 sm:h-20 px-6 sm:px-10 border-t border-zinc-200 bg-white flex items-center justify-between gap-4 text-xs font-semibold text-zinc-600 z-10">
        <span>Showing {filteredOptions.length} option{filteredOptions.length !== 1 ? 's' : ''}</span>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 text-xs font-bold text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer bg-zinc-100 hover:bg-zinc-200 rounded-xl"
        >
          Close Panel
        </button>
      </div>
    </div>
  );

  return createPortal(modalJSX, document.body);
}
