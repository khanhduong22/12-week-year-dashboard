'use client';

import React from 'react';

export interface OverviewMetricsProps {
  totalFocusMinutes?: number;
  weekFocusMinutes?: number;
  todayFocusMinutes?: number;
  totalCompletedTasks?: number;
  weekCompletedTasks?: number;
  todayCompletedTasks?: number;
}

export function OverviewMetricsCards({
  totalFocusMinutes = 0,
  weekFocusMinutes = 0,
  todayFocusMinutes = 0,
  totalCompletedTasks = 0,
  weekCompletedTasks = 0,
  todayCompletedTasks = 0,
}: OverviewMetricsProps) {
  const cards = [
    {
      title: 'Total Focus Time',
      value: `${totalFocusMinutes}m`,
      indicatorColor: 'bg-rose-500',
      textColor: 'text-rose-400',
    },
    {
      title: 'Focus Time of This Week',
      value: `${weekFocusMinutes}m`,
      indicatorColor: 'bg-rose-500',
      textColor: 'text-rose-400',
    },
    {
      title: 'Focus Time of Today',
      value: `${todayFocusMinutes}m`,
      indicatorColor: 'bg-rose-500',
      textColor: 'text-rose-400',
    },
    {
      title: 'Total Completed Tasks',
      value: totalCompletedTasks,
      indicatorColor: 'bg-sky-500',
      textColor: 'text-sky-400',
    },
    {
      title: 'Tasks Completed This Week',
      value: weekCompletedTasks,
      indicatorColor: 'bg-sky-500',
      textColor: 'text-sky-400',
    },
    {
      title: 'Tasks Completed Today',
      value: todayCompletedTasks,
      indicatorColor: 'bg-sky-500',
      textColor: 'text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-[#181824] border border-slate-800/80 rounded-2xl p-4 space-y-2 select-none shadow-md"
        >
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-3.5 rounded-full ${card.indicatorColor}`} />
            <span className="text-[11px] font-semibold text-slate-300 leading-tight">
              {card.title}
            </span>
          </div>

          <div className={`text-2xl font-black font-mono tracking-tight ${card.textColor}`}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
