'use client';

import React from 'react';

export interface MatrixDay {
  date: string;
  focusMinutes: number;
  sessions?: Array<{
    id: number;
    title: string;
    durationMinutes: number;
    completedAt?: string;
  }>;
}

interface PomodoroRecordsMatrixProps {
  days?: MatrixDay[];
}

export function PomodoroRecordsMatrix({ days = [] }: PomodoroRecordsMatrixProps) {
  const hours = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

  // Display 14 days
  const displayDays = days.slice(0, 14);

  return (
    <div className="bg-[#181824] border border-slate-800/80 rounded-2xl p-5 space-y-4 shadow-lg">
      <h3 className="text-sm font-bold text-white tracking-wide">Pomodoro Records</h3>

      <div className="overflow-x-auto">
        <div className="min-w-[600px] text-xs">
          {/* Header Row: Hours */}
          <div className="grid grid-cols-[100px_repeat(12,1fr)] items-center border-b border-slate-800 pb-2 mb-1 text-[11px] text-slate-500 font-mono">
            <div>Date</div>
            {hours.map((h) => (
              <div key={h} className="text-center">
                {h}:00
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {displayDays.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs italic">
              No Pomodoro records for this period.
            </div>
          ) : (
            <div className="space-y-1 font-mono">
              {displayDays.map((dayItem) => {
                const dateLabel =
                  dayItem.date === new Date().toISOString().split('T')[0]
                    ? 'Today'
                    : dayItem.date;

                return (
                  <div
                    key={dayItem.date}
                    className="grid grid-cols-[100px_repeat(12,1fr)] items-center py-1 border-b border-slate-800/40 text-[11px]"
                  >
                    <div className="text-slate-400 font-semibold truncate">
                      {dateLabel}
                    </div>

                    {hours.map((h) => {
                      // Check if any session occurred in this 2-hour window
                      const hasSession = dayItem.sessions?.some((s) => {
                        if (!s.completedAt) return false;
                        const sHour = new Date(s.completedAt).getHours();
                        return sHour >= h && sHour < h + 2;
                      });

                      return (
                        <div key={h} className="px-0.5">
                          <div
                            className={`h-4 rounded-md transition-all ${
                              hasSession
                                ? 'bg-rose-500 shadow-sm shadow-rose-500/50 scale-105'
                                : 'bg-[#0f0f15] border border-slate-800/60'
                            }`}
                            title={
                              hasSession
                                ? `${dateLabel} ${h}:00-${h + 2}:00: Focus Session`
                                : `${dateLabel} ${h}:00-${h + 2}:00`
                            }
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
