'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export interface DistributionItem {
  goalName: string;
  category: string;
  minutes: number;
  percentage: number;
}

interface ProjectTimeDistributionProps {
  distribution?: DistributionItem[];
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  onTimeframeChange?: (tf: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
}

export function ProjectTimeDistribution({
  distribution = [],
  timeframe = 'monthly',
  onTimeframeChange,
}: ProjectTimeDistributionProps) {
  const [activeTf, setActiveTf] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(timeframe);

  const handleTfClick = (tf: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setActiveTf(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
  };

  const COLORS = ['#f43f5e', '#6366f1', '#10b981', '#f59e0b', '#a855f7', '#06b6d4'];

  return (
    <div className="bg-[#181824] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between h-[360px] select-none">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Project Time Distribution
        </h3>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="bg-[#0f0f15] p-1 rounded-xl border border-slate-800 flex items-center gap-0.5 text-xs">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => handleTfClick(tf)}
                className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                  activeTf === tf
                    ? 'bg-[#222232] text-white shadow-sm border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-semibold text-slate-300 px-2">Today</span>
            <button className="p-1 rounded-lg bg-[#0f0f15] text-slate-400 hover:text-white border border-slate-800">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {distribution.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-2 text-slate-500">
          <Package className="w-10 h-10 stroke-[1.5]" />
          <span className="text-xs font-medium">No Data</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 flex-1">
          {/* Recharts Pie Chart */}
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="minutes"
                  nameKey="goalName"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181824',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: unknown) => [`${value} mins`, 'Focus Time']}
                />





              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Goal Item Legend List */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
            {distribution.map((item, idx) => {
              const colorHex = COLORS[idx % COLORS.length];
              return (
                <div
                  key={item.goalName}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#0f0f15] border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <span className="font-semibold text-slate-200 truncate">{item.goalName}</span>
                  </div>

                  <div className="flex items-center gap-2 font-mono flex-shrink-0">
                    <span className="text-slate-400 font-bold">{item.minutes}m</span>
                    <span className="font-black text-rose-400">{item.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
