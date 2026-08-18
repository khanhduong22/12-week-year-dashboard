'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

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

  const colors = [
    'bg-rose-500 text-rose-400 border-rose-500/30',
    'bg-indigo-500 text-indigo-400 border-indigo-500/30',
    'bg-emerald-500 text-emerald-400 border-emerald-500/30',
    'bg-amber-500 text-amber-400 border-amber-500/30',
    'bg-purple-500 text-purple-400 border-purple-500/30',
  ];

  return (
    <div className="bg-[#181824] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between h-[360px]">
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
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {/* Progress Stack Bar */}
          <div className="h-3 rounded-full bg-[#0f0f15] border border-slate-800 flex overflow-hidden">
            {distribution.map((item, idx) => (
              <div
                key={item.goalName}
                style={{ width: `${item.percentage}%` }}
                className={`${colors[idx % colors.length].split(' ')[0]} transition-all`}
                title={`${item.goalName}: ${item.percentage}% (${item.minutes}m)`}
              />
            ))}
          </div>

          {/* Goal Item List */}
          <div className="space-y-2 pt-1">
            {distribution.map((item, idx) => {
              const colorClass = colors[idx % colors.length];
              return (
                <div
                  key={item.goalName}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f0f15] border border-slate-800/60 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full ${colorClass.split(' ')[0]}`} />
                    <span className="font-semibold text-slate-200 truncate">{item.goalName}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400 font-bold">{item.minutes}m</span>
                    <span className={`font-black ${colorClass.split(' ')[1]}`}>
                      {item.percentage}%
                    </span>
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
