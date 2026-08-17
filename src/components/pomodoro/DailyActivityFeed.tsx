'use client';

import React from 'react';
import { Calendar, ArrowUpRight, Clock, Sparkles } from 'lucide-react';

export interface ActivitySession {
  id: number;
  title: string;
  durationMinutes: number;
  isUnplanned: boolean;
  status: string;
  completedAt?: string;
  tactic?: {
    id: number;
    name: string;
  };
  tags?: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  activityLogs?: Array<{
    id: number;
    outputSummary: string;
    reflectionNotes?: string;
  }>;
}

export interface DailyBreakdownDay {
  date: string;
  totalMinutes: number;
  totalHours: string;
  sessionCount: number;
  intensityShade: 'none' | 'light' | 'medium' | 'dark' | 'intense';
  sessions: ActivitySession[];
}

interface DailyActivityFeedProps {
  days: DailyBreakdownDay[];
  onPromoteClick?: (session: ActivitySession) => void;
}

export function DailyActivityFeed({ days = [], onPromoteClick }: DailyActivityFeedProps) {
  const getShadeStyle = (shade: DailyBreakdownDay['intensityShade']) => {
    switch (shade) {
      case 'intense':
        return {
          bg: 'bg-emerald-950/70 border-emerald-500/40',
          badge: 'bg-emerald-400 text-slate-950 font-bold',
          bar: 'bg-emerald-400',
        };
      case 'dark':
        return {
          bg: 'bg-emerald-950/40 border-emerald-600/30',
          badge: 'bg-emerald-600 text-white font-semibold',
          bar: 'bg-emerald-500',
        };
      case 'medium':
        return {
          bg: 'bg-indigo-950/30 border-indigo-600/20',
          badge: 'bg-indigo-600/80 text-indigo-200',
          bar: 'bg-indigo-500',
        };
      case 'light':
        return {
          bg: 'bg-slate-900/80 border-slate-800',
          badge: 'bg-slate-800 text-slate-300',
          bar: 'bg-slate-700',
        };
      default:
        return {
          bg: 'bg-slate-950/50 border-slate-900',
          badge: 'bg-slate-900 text-slate-500',
          bar: 'bg-slate-800',
        };
    }
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          Nhật ký làm việc & Kết quả phát triển từng ngày
        </h3>
        <span className="text-xs text-slate-400 font-mono">Hiển thị {days.length} ngày gần nhất</span>
      </div>

      {days.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <Clock className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">Chưa có nhật ký phiên làm việc nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const style = getShadeStyle(day.intensityShade);

            return (
              <div
                key={day.date}
                className={`rounded-2xl border p-5 transition-all duration-300 space-y-4 ${style.bg}`}
              >
                {/* Day Header & Intensity Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${style.bar}`} />
                    <div>
                      <h4 className="text-sm font-bold text-white capitalize">{formatDateLabel(day.date)}</h4>
                      <p className="text-[11px] text-slate-400">
                        Tổng tập trung: <strong className="text-emerald-300 font-mono">{day.totalHours} giờ</strong> ({day.totalMinutes} phút) • {day.sessionCount} phiên
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[11px] rounded-lg ${style.badge}`}>
                      Mật độ: {day.intensityShade.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Sessions list */}
                <div className="space-y-3">
                  {day.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-all"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{session.title}</span>
                            {session.isUnplanned ? (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-md">
                                Unplanned
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                                🎯 {session.tactic?.name || 'Planned'}
                              </span>
                            )}
                          </div>

                          {/* Tags */}
                          {session.tags && session.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {session.tags.map((t) => (
                                <span
                                  key={t.id}
                                  className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-900 text-slate-400 border border-slate-800"
                                >
                                  {t.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            {session.durationMinutes} phút
                          </span>

                          {session.isUnplanned && onPromoteClick && (
                            <button
                              onClick={() => onPromoteClick(session)}
                              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all"
                              title="Chuyển thành Tactic 12-Week"
                            >
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Promote ➔ Tactic
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Output Summary & Reflection Notes */}
                      {session.activityLogs && session.activityLogs.length > 0 && (
                        <div className="mt-2 p-3 rounded-lg bg-slate-900/90 border border-slate-800/80 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            Đã hoàn thành / Kết quả:
                          </div>
                          <p className="text-xs text-slate-200 leading-relaxed font-normal">
                            {session.activityLogs[0].outputSummary}
                          </p>
                          {session.activityLogs[0].reflectionNotes && (
                            <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-800/60 mt-1">
                              💡 Ghi chú: {session.activityLogs[0].reflectionNotes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
