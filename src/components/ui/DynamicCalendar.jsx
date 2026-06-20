import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { THEME } from '../../theme';

export default function DynamicCalendar({ startDate, endDate, onChange, calendarData = [] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  // Ajuster pour que lundi = 0, dimanche = 6
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const handleDayClick = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Si la date est indisponible, ne rien faire
    if (calendarData.some(ud => ud.date === dateStr && ud.status === 'UNAVAILABLE')) return;

    // Si la date est dans le passé, ne rien faire
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(dateStr) < today) return;

    if (!startDate || (startDate && endDate)) {
      onChange(dateStr, ''); // Nouveau début
    } else if (startDate && !endDate) {
      if (new Date(dateStr) >= new Date(startDate)) {
        // Vérifier s'il y a des jours indisponibles entre startDate et dateStr
        const start = new Date(startDate);
        const end = new Date(dateStr);
        let hasConflict = false;
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          if (calendarData.some(ud => ud.date === dStr && ud.status === 'UNAVAILABLE')) {
            hasConflict = true;
            break;
          }
        }
        
        if (hasConflict) {
          // Si conflit, le clic devient le nouveau startDate
          onChange(dateStr, '');
        } else {
          onChange(startDate, dateStr);
        }
      } else {
        onChange(dateStr, ''); // Si on clique avant le startDate, ça devient le nouveau startDate
      }
    }
  };

  const getDayStatus = (day) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateObj = new Date(dateStr);

    const isPast = dateObj < today;
    const dayData = calendarData.find(d => d.date === dateStr);
    
    let isSelected = false;
    let isInRange = false;

    if (startDate && dateStr === startDate) isSelected = true;
    if (endDate && dateStr === endDate) isSelected = true;
    
    if (startDate && endDate) {
      if (dateObj > new Date(startDate) && dateObj < new Date(endDate)) {
        isInRange = true;
      }
    }

    return {
      isPast,
      isUnavailable: dayData?.status === 'UNAVAILABLE',
      isConstrained: dayData?.status === 'CONSTRAINED',
      dayData,
      isSelected,
      isInRange,
      dateStr
    };
  };

  return (
    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 md:p-6 w-full max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button type="button" onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-white font-bold text-lg">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button type="button" onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs text-gray-500 font-semibold py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for starting day */}
        {Array.from({ length: startingDay }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const { isPast, isUnavailable, isConstrained, dayData, isSelected, isInRange } = getDayStatus(day);

          let baseClasses = "relative h-10 w-full flex items-center justify-center text-sm rounded-lg transition-all ";
          
          if (isPast) {
            baseClasses += "text-gray-700 cursor-not-allowed";
          } else if (isUnavailable) {
            baseClasses += "bg-white/5 text-gray-500 cursor-not-allowed border border-red-500/20";
          } else if (isSelected) {
            baseClasses += "bg-[#ff007f] text-white font-bold shadow-[0_0_15px_rgba(255,0,127,0.4)] cursor-pointer z-10";
          } else if (isInRange) {
            baseClasses += "bg-[#ff007f]/20 text-white cursor-pointer";
          } else if (isConstrained) {
            baseClasses += "bg-amber-500/10 text-amber-300 cursor-pointer border border-amber-500/30 hover:bg-amber-500/20";
          } else {
            baseClasses += "text-gray-300 hover:bg-white/10 cursor-pointer";
          }

          return (
            <div key={day} className="relative group">
              <button
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={isPast || isUnavailable}
                className={baseClasses}
              >
                {day}
              </button>
              
              {/* Tooltip for unavailable items */}
              {isUnavailable && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[200px] bg-red-900/90 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none border border-red-500/50">
                  <div className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Rupture de stock : {dayData?.equipment_names}</span>
                  </div>
                </div>
              )}

              {/* Tooltip for constrained items */}
              {isConstrained && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[250px] bg-amber-900/95 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none border border-amber-500/50 shadow-xl">
                  <div className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <div className="flex flex-col gap-1.5">
                      <span className="font-semibold text-amber-300">Stock réduit :</span>
                      <div className="flex flex-col">
                        {dayData?.details?.map((detail, idx) => (
                          <span key={idx} className="text-amber-100/90">
                            • {detail.name} ({detail.available} restant{detail.available > 1 ? 's' : ''})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
