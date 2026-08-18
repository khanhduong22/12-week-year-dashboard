'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TrendPoint {
  date: string;
  focusMinutes: number;
  completedTasks: number;
}

interface FocusTrendChartsProps {
  focusStats?: { topMinutes: number; avgMinutes: number; totalMinutes: number };
  taskStats?: { topTasks: number; avgTasks: number; totalTasks: number };
  series?: TrendPoint[];
  onTimeframeChange?: (tf: 'daily' | 'weekly' | 'monthly') => void;
}

export function FocusTrendCharts({
  focusStats = { topMinutes: 0, avgMinutes: 0, totalMinutes: 0 },
  taskStats = { topTasks: 0, avgTasks: 0, totalTasks: 0 },
  series = [],
  onTimeframeChange,
}: FocusTrendChartsProps) {
  const [activeTf, setActiveTf] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const handleTfClick = (tf: 'daily' | 'weekly' | 'monthly') => {
    setActiveTf(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
  };

  const maxMins = Math.max(focusStats.topMinutes, 60);
  const maxTasks = Math.max(taskStats.topTasks, 5);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Focus Time Chart */}
      <div className="bg-[#181824] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-lg h-[320px] flex flex-col justify-between">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Focus Time Chart</h4>
            <div className="text-[11px] text-slate-400 space-x-2 mt-0.5">
              <span>Top: <strong className="text-rose-400">{focusStats.topMinutes}m</strong></span>
              <span>Average: <strong className="text-white">{focusStats.avgMinutes}m</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-[#0f0f15] p-1 rounded-xl border border-slate-800 flex items-center gap-0.5 text-xs">
              {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => handleTfClick(tf)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    activeTf === tf
                      ? 'bg-[#222232] text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5">
              <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* SVG Trend Line / Bar Chart */}
        <div className="flex-1 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-800/80">
          {series.length === 0 ? (
            <div className="w-full text-center text-xs text-slate-500 italic pb-8">
              No Focus Time data
            </div>
          ) : (
            series.map((item) => {
              const heightPct = Math.min(100, Math.round((item.focusMinutes / maxMins) * 100));
              const dateLabel = item.date.slice(5);

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-all bg-rose-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap">
                    {item.focusMinutes}m ({item.date})
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[18px] bg-rose-500 rounded-t-sm group-hover:bg-rose-400 transition-all min-h-[4px]"
                  />

                  {/* X Label */}
                  <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                    {dateLabel}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Task Completion Chart */}
      <div className="bg-[#181824] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-lg h-[320px] flex flex-col justify-between">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Task Chart</h4>
            <div className="text-[11px] text-slate-400 space-x-2 mt-0.5">
              <span>Top: <strong className="text-sky-400">{taskStats.topTasks} Tasks</strong></span>
              <span>Average: <strong className="text-white">{taskStats.avgTasks} Tasks</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-[#0f0f15] p-1 rounded-xl border border-slate-800 flex items-center gap-0.5 text-xs">
              {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => handleTfClick(tf)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    activeTf === tf
                      ? 'bg-[#222232] text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5">
              <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* SVG Trend Line / Bar Chart */}
        <div className="flex-1 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-800/80">
          {series.length === 0 ? (
            <div className="w-full text-center text-xs text-slate-500 italic pb-8">
              No Task Completion data
            </div>
          ) : (
            series.map((item) => {
              const heightPct = Math.min(100, Math.round((item.completedTasks / maxTasks) * 100));
              const dateLabel = item.date.slice(5);

              return (
                <div key={item.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-all bg-sky-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap">
                    {item.completedTasks} Tasks ({item.date})
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[18px] bg-sky-500 rounded-t-sm group-hover:bg-sky-400 transition-all min-h-[4px]"
                  />

                  {/* X Label */}
                  <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                    {dateLabel}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
