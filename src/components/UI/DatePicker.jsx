import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export default function DatePicker({ label, name, value, onChange, placeholder = "DD/MM/YYYY", required = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const parseDateStr = (dateStr) => {
    if (!dateStr) return new Date();
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return new Date(y, m, d);
      }
    }
    return new Date();
  };

  const initialDate = parseDateStr(value);
  const [viewDate, setViewDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(value ? initialDate : null);

  useEffect(() => {
    if (value) {
      setSelectedDate(parseDateStr(value));
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const monthsList = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleYearChange = (e) => {
    setViewDate(new Date(parseInt(e.target.value, 10), currentMonth, 1));
  };

  const handleMonthChange = (e) => {
    setViewDate(new Date(currentYear, parseInt(e.target.value, 10), 1));
  };

  const handleDateSelect = (day) => {
    const dayStr = String(day).padStart(2, "0");
    const monthStr = String(currentMonth + 1).padStart(2, "0");
    const formatted = `${dayStr}/${monthStr}/${currentYear}`;
    
    onChange({
      target: {
        name,
        value: formatted
      }
    });
    setIsOpen(false);
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  const daysGrid = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= totalDays; d++) {
    daysGrid.push(d);
  }

  const years = [];
  const startYear = 1940;
  const endYear = new Date().getFullYear() + 10;
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  const isSelectedDay = (day) => {
    if (!selectedDate || !day) return false;
    return selectedDate.getDate() === day &&
           selectedDate.getMonth() === currentMonth &&
           selectedDate.getFullYear() === currentYear;
  };

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-zinc-700 tracking-wide select-none">
          {label}
          {required && <span className="text-rose-500 font-bold ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value || ""}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder={placeholder}
          className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#2B7FFF] font-bold pr-10 cursor-pointer text-zinc-700 shadow-2xs"
        />
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#2B7FFF] cursor-pointer"
        >
          <CalendarIcon className="w-4 h-4" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 mt-2 p-4 w-[285px] rounded-2xl bg-white border border-zinc-200 shadow-xl text-zinc-800">
          <div className="flex items-center justify-between gap-1 pb-3 mb-2 border-b border-zinc-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 font-bold text-xs cursor-pointer select-none"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <div className="flex gap-1 items-center">
              <select
                value={currentMonth}
                onChange={handleMonthChange}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-1.5 py-0.5 text-[10px] font-bold focus:outline-none cursor-pointer text-zinc-700"
              >
                {monthsList.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
              <select
                value={currentYear}
                onChange={handleYearChange}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-1.5 py-0.5 text-[10px] font-bold focus:outline-none cursor-pointer text-zinc-700"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-lg flex items-center justify-center border border-zinc-200 hover:bg-zinc-50 font-bold text-xs cursor-pointer select-none"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-zinc-400 mb-2 select-none">
            {weekdays.map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {daysGrid.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="w-8 h-8" />;
              }

              const selected = isSelectedDay(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={`w-8 h-8 text-[10px] font-bold rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    selected
                      ? "bg-[#2B7FFF] text-white shadow-sm"
                      : "text-zinc-700 hover:bg-indigo-50 hover:text-[#2B7FFF]"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
