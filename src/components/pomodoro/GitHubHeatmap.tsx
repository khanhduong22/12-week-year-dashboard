'use client';

import React, { useState } from 'react';
import { Activity, Flame } from 'lucide-react';

interface HeatmapDay {
  date: string;
  focusMinutes: number;
  focusHours: string;
  sessionCount: number;
  intensityLevel: number;
  sessions?: Array<{
    title: string;
    durationMinutes: number;
    outputSummary?: string;
    tacticName?: string;
  }>;
}

interface HourlyDistribution {
  hour: number;
  label: string;
  focusMinutes: number;
}

interface GitHubHeatmapProps {
  days: HeatmapDay[];
  hourlyDistribution?: HourlyDistribution[];
  range?: 'week' | 'month' | 'year';
  onRangeChange?: (range: 'week' | 'month' | 'year') => void;
  totalFocusMinutes?: number;
  totalSessions?: number;
}

export function GitHubHeatmap({
  days = [],
  hourlyDistribution = [],
  range = 'month',
  onRangeChange,
  totalFocusMinutes = 0,
  totalSessions = 0,
}: GitHubHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  const getIntensityClass = (level: number) => {
    switch (level) {
      case 4:
        return 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/40 text-slate-950 font-bold';
      case 3:
        return 'bg-emerald-600 border-emerald-500 text-slate-950';
      case 2:
        return 'bg-emerald-800 border-emerald-700 text-emerald-200';
      case 1:
        return 'bg-emerald-950 border-emerald-800/80 text-emerald-400';
      default:
        return 'bg-slate-900 border-slate-800/60 text-slate-600 hover:border-slate-700';
    }
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { weekday: 'short' });
  };

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Focus Heatmap Analytics</h3>
            <p className="text-xs text-slate-400">Tần suất & Mật độ thời gian làm việc theo giờ / ngày</p>
          </div>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['week', 'month', 'year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange && onRangeChange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                range === r
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {r === 'week' ? 'Tuần này' : r === 'month' ? 'Tháng này' : 'Cả Năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 block font-medium">Tổng số giờ Deep Work</span>
          <span className="text-xl font-black text-emerald-400 font-mono">
            {(totalFocusMinutes / 60).toFixed(1)} <span className="text-xs font-normal text-slate-400">giờ</span>
          </span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 block font-medium">Tổng phiên Pomodoro</span>
          <span className="text-xl font-black text-indigo-400 font-mono">
            {totalSessions} <span className="text-xs font-normal text-slate-400">phiên</span>
          </span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3">
          <span className="text-[11px] text-slate-400 block font-medium">Trung bình / ngày</span>
          <span className="text-xl font-black text-amber-400 font-mono">
            {days.length > 0 ? (totalFocusMinutes / days.length).toFixed(0) : 0} <span className="text-xs font-normal text-slate-400">phút</span>
          </span>
        </div>
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-center">
          <span className="text-[11px] text-slate-400 block font-medium mb-1">Mật độ màu (Intensity)</span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 mr-1">Ít</span>
            {[0, 1, 2, 3, 4].map((lvl) => (
              <div key={lvl} className={`w-3.5 h-3.5 rounded border ${getIntensityClass(lvl)}`} />
            ))}
            <span className="text-[10px] text-slate-300 ml-1">Nhiều</span>
          </div>
        </div>
      </div>

      {/* GitHub Style Heatmap Grid */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(32px,1fr))] gap-2">
            {days.map((day) => (
              <div
                key={day.date}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                className="group relative flex flex-col items-center cursor-pointer"
              >
                {/* Square Cell */}
                <div
                  className={`w-full aspect-square rounded-lg border flex flex-col items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:z-10 ${getIntensityClass(
                    day.intensityLevel,
                  )}`}
                >
                  <span className="text-[10px] font-mono opacity-80">
                    {new Date(day.date).getDate()}
                  </span>
                </div>

                <span className="text-[9px] text-slate-500 mt-1 uppercase font-mono">
                  {getDayName(day.date)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover Details Panel */}
        {hoveredDay && (
          <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1.5 animate-fadeIn">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-emerald-400">
                📅 Ngày {hoveredDay.date} ({getDayName(hoveredDay.date)})
              </span>
              <span className="font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                {hoveredDay.focusMinutes} phút ({hoveredDay.sessionCount} phiên)
              </span>
            </div>

            {hoveredDay.sessions && hoveredDay.sessions.length > 0 ? (
              <div className="space-y-1 pt-1 border-t border-slate-800/60">
                {hoveredDay.sessions.map((s, idx) => (
                  <div key={idx} className="flex items-start justify-between text-[11px] text-slate-300 gap-2">
                    <span className="truncate">
                      • <strong className="text-white">{s.title}</strong>
                      {s.tacticName && <span className="text-indigo-400 ml-1">[{s.tacticName}]</span>}
                      {s.outputSummary && <span className="text-slate-400 block text-[10px] pl-3 italic">{s.outputSummary}</span>}
                    </span>
                    <span className="text-slate-400 font-mono shrink-0">{s.durationMinutes}m</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 italic">Chưa có phiên làm việc nào được ghi nhận trong ngày này.</p>
            )}
          </div>
        )}
      </div>

      {/* Hourly Distribution Matrix (GitHub Hourly Bar Chart) */}
      {hourlyDistribution && hourlyDistribution.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Phân bổ thời gian theo các khung giờ trong ngày (00h - 23h)
            </h4>
          </div>

          <div className="grid grid-cols-24 gap-1 items-end h-24 pt-4 border-b border-slate-800/60">
            {hourlyDistribution.map((h) => {
              const maxMinutes = Math.max(...hourlyDistribution.map((item) => item.focusMinutes), 1);
              const heightPercent = Math.min(100, Math.max(8, (h.focusMinutes / maxMinutes) * 100));

              return (
                <div key={h.hour} className="group relative flex flex-col items-center h-full justify-end">
                  {/* Hover tooltip */}
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-[10px] text-white px-2 py-1 rounded shadow-lg z-20 whitespace-nowrap">
                    {h.label}: {h.focusMinutes} phút
                  </div>

                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t transition-all duration-300 ${
                      h.focusMinutes > 60
                        ? 'bg-emerald-400'
                        : h.focusMinutes > 30
                        ? 'bg-emerald-600'
                        : h.focusMinutes > 0
                        ? 'bg-indigo-600/70'
                        : 'bg-slate-900'
                    }`}
                  />
                  <span className="text-[8px] text-slate-600 font-mono mt-1">{h.hour}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
