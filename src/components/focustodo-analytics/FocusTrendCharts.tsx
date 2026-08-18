'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

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

  const chartData = series.map((item) => ({
    ...item,
    shortDate: item.date.slice(5),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Focus Time Area Chart (Recharts) */}
      <div className="bg-[#181824] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-lg h-[340px] flex flex-col justify-between select-none">
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
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    activeTf === tf
                      ? 'bg-[#222232] text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5">
              <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="flex-1 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
              No Focus Time data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222232" vertical={false} />
                <XAxis dataKey="shortDate" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181824',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: unknown) => [`${value} minutes`, 'Focus Time']}
                />
                <Area
                  type="monotone"
                  dataKey="focusMinutes"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#roseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Task Completion Bar Chart (Recharts) */}
      <div className="bg-[#181824] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-lg h-[340px] flex flex-col justify-between select-none">
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
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    activeTf === tf
                      ? 'bg-[#222232] text-white border border-slate-700 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5">
              <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="flex-1 w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
              No Task Completion data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222232" vertical={false} />
                <XAxis dataKey="shortDate" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181824',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: unknown) => [`${value} Tasks`, 'Completed Tasks']}
                />





                <Bar dataKey="completedTasks" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
