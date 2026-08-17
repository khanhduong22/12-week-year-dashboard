'use client';

import React from 'react';
import { Calendar, Target, Layers } from 'lucide-react';

interface TacticOption {
  id: number;
  name: string;
}

interface PomodoroFilterBarProps {
  timeframe: 'today' | 'week' | 'month' | 'all';
  onTimeframeChange: (tf: 'today' | 'week' | 'month' | 'all') => void;
  selectedTacticId?: number;
  onTacticChange: (tacticId?: number) => void;
  isUnplannedFilter?: boolean | 'all';
  onUnplannedChange: (val: boolean | 'all') => void;
  tactics?: TacticOption[];
}

export function PomodoroFilterBar({
  timeframe,
  onTimeframeChange,
  selectedTacticId,
  onTacticChange,
  isUnplannedFilter = 'all',
  onUnplannedChange,
  tactics = [],
}: PomodoroFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl">
      {/* Timeframe selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-emerald-400" />
        <span className="text-xs font-semibold text-slate-300">Khung thời gian:</span>
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'today', label: 'Hôm nay' },
            { id: 'week', label: '7 ngày qua' },
            { id: 'month', label: 'Tháng này' },
            { id: 'all', label: 'Tất cả' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => onTimeframeChange(tf.id as 'today' | 'week' | 'month' | 'all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Goal / Tactic Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          <select
            value={selectedTacticId || ''}
            onChange={(e) => onTacticChange(e.target.value ? Number(e.target.value) : undefined)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">Tất cả mục tiêu 12-Week</option>
            {tactics.map((t) => (
              <option key={t.id} value={t.id}>
                🎯 {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Planned vs Unplanned filter */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <select
            value={isUnplannedFilter === 'all' ? 'all' : isUnplannedFilter ? 'true' : 'false'}
            onChange={(e) => {
              const val = e.target.value;
              onUnplannedChange(val === 'all' ? 'all' : val === 'true');
            }}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">Tất cả loại hình (Planned + Unplanned)</option>
            <option value="false">Chỉ Planned (12-Week Strategy)</option>
            <option value="true">Chỉ Unplanned (Ad-hoc tasks)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
