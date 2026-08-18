'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CalendarDayItem {
  date: string;
  dayNumber: number;
  minutes: number;
  isGoalMet: boolean;
}

interface FocusGoalCalendarProps {
  targetHours?: number;
  focusDaysCount?: number;
  completedGoalDaysCount?: number;
  completionRate?: number;
  calendarDays?: CalendarDayItem[];
}

export function FocusGoalCalendar({
  targetHours = 3,
  focusDaysCount = 0,
  completedGoalDaysCount = 0,
  completionRate = 0,
  calendarDays = [],
}: FocusGoalCalendarProps) {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const now = new Date();
  const currentMonthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

  const weekHeaders = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  return (
    <div className="bg-[#181824] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between h-[360px]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Focus Time Goal
        </h3>
        <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-xl">
          Goal: {targetHours}H
        </span>
      </div>

      {/* Subheader Stats */}
      <div className="text-[11px] text-slate-400 space-x-3">
        <span>
          Focus Days: <strong className="text-white">{focusDaysCount} days</strong>
        </span>
        <span>
          Completed Goal Days: <strong className="text-rose-400">{completedGoalDaysCount} days</strong>
        </span>
        <span>
          Goal Completion Rate: <strong className="text-amber-400">{completionRate}%</strong>
        </span>
      </div>

      {/* Calendar Control */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
        <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs font-bold text-white">{currentMonthName}</span>
        <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Month Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 text-center text-xs flex-1">
        {/* Days of week header */}
        {weekHeaders.map((dh) => (
          <div key={dh} className="text-[10px] font-bold text-slate-500 py-1">
            {dh}
          </div>
        ))}

        {/* Day Cells */}
        {calendarDays.slice(0, 31).map((day) => {
          const isToday = day.date === new Date().toISOString().split('T')[0];

          return (
            <div
              key={day.date}
              className={`p-1 rounded-xl border flex flex-col items-center justify-center transition-all ${
                day.isGoalMet
                  ? 'bg-rose-500 text-slate-950 border-rose-400 font-black shadow-md shadow-rose-500/20'
                  : isToday
                  ? 'bg-[#222232] text-rose-400 border-rose-500/50 font-bold'
                  : day.minutes > 0
                  ? 'bg-[#0f0f15] text-slate-200 border-slate-700'
                  : 'bg-[#0f0f15]/50 text-slate-500 border-slate-800/40'
              }`}
              title={`${day.date}: ${day.minutes}m (${(day.minutes / 60).toFixed(1)}h)`}
            >
              <span className="text-[11px] leading-none">{day.dayNumber}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
