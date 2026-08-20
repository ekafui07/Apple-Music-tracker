import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Music } from 'lucide-react';

export default function CalendarView({ customers, currency }) {
  const [currentDate, setCurrentDate] = useState(new Date('2026-08-01'));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 7 for August

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfWeek }, (_, i) => i);

  const formatDateStr = (day) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-5 rounded-2xl border border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Apple Music Customer Renewal Calendar</h3>
            <p className="text-xs text-gray-400">View subscriber payment due dates across the month</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-extrabold text-white min-w-[120px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="glass-card rounded-2xl p-4 border border-gray-800">
        
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800 pb-2">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {paddingDays.map(p => (
            <div key={`pad-${p}`} className="h-28 rounded-xl bg-gray-900/30 border border-gray-900 p-2 opacity-30" />
          ))}

          {daysArray.map(day => {
            const dateStr = formatDateStr(day);
            const dueCustomers = customers.filter(c => c.dueDate === dateStr);
            const isToday = day === 20 && month === 7;

            return (
              <div 
                key={day}
                className={`h-28 rounded-xl p-2 flex flex-col justify-between transition-all border ${
                  isToday 
                    ? 'bg-rose-950/20 border-rose-500/50'
                    : 'bg-gray-900/50 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-rose-400 bg-rose-500/20 px-1.5 py-0.5 rounded' : 'text-gray-300'}`}>
                    {day}
                  </span>
                  {dueCustomers.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                  )}
                </div>

                <div className="space-y-1 overflow-y-auto max-h-16">
                  {dueCustomers.map(c => (
                    <div 
                      key={c.id}
                      className="px-1.5 py-1 rounded text-[10px] font-bold text-white bg-rose-600 truncate shadow-sm"
                      title={`${c.name} (${c.plan}) - ${currency.symbol}${(c.amount * currency.rate).toFixed(2)}`}
                    >
                      {c.name} ({currency.symbol}{(c.amount * currency.rate).toFixed(0)})
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
