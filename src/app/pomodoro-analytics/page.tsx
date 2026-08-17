'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { PomodoroTimerWidget } from '@/components/pomodoro/PomodoroTimerWidget';
import { GitHubHeatmap } from '@/components/pomodoro/GitHubHeatmap';
import { DailyActivityFeed, ActivitySession, DailyBreakdownDay } from '@/components/pomodoro/DailyActivityFeed';
import { PomodoroFilterBar } from '@/components/pomodoro/PomodoroFilterBar';
import { PromoteModal } from '@/components/pomodoro/PromoteModal';

export default function PomodoroAnalyticsPage() {
  const [range, setRange] = useState<'week' | 'month' | 'year'>('month');
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('month');
  const [selectedTacticId, setSelectedTacticId] = useState<number | undefined>(undefined);
  const [isUnplannedFilter, setIsUnplannedFilter] = useState<boolean | 'all'>('all');
  const [loading, setLoading] = useState(false);

  // Data states
  const [heatmapData, setHeatmapData] = useState<{
    days: Array<unknown>;
    hourlyDistribution: Array<unknown>;
    totalMinutes?: number;
    totalSessions?: number;
  }>({ days: [], hourlyDistribution: [] });
  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdownDay[]>([]);
  const [tactics, setTactics] = useState<Array<{ id: number; name: string }>>([]);

  // Promote Modal state
  const [promoteSession, setPromoteSession] = useState<ActivitySession | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Heatmap
      const heatmapRes = await fetch(
        `${API_URL}/analytics/heatmap?range=${range}${selectedTacticId ? `&tacticId=${selectedTacticId}` : ''}`,
      );
      if (heatmapRes.ok) {
        setHeatmapData(await heatmapRes.json());
      }

      // 2. Fetch Daily Breakdown
      const unplannedQuery = isUnplannedFilter !== 'all' ? `&isUnplanned=${isUnplannedFilter}` : '';
      const tacticQuery = selectedTacticId ? `&tacticId=${selectedTacticId}` : '';
      const breakdownRes = await fetch(
        `${API_URL}/analytics/daily-breakdown?1=1${tacticQuery}${unplannedQuery}`,
      );
      if (breakdownRes.ok) {
        const json = await breakdownRes.json();
        setDailyBreakdown(json.days || []);
      }

      // 3. Fetch Tactics for selector
      const tacticsRes = await fetch(`${API_URL}/tactics`);
      if (tacticsRes.ok) {
        const data = await tacticsRes.json();
        const flatTactics: Array<{ id: number; name: string }> = [];
        data.forEach((item: { indicators?: Array<{ id: number; name: string; type: string }> }) => {
          if (item.indicators) {
            item.indicators
              .filter((ind) => ind.type === 'LEAD')
              .forEach((ind) => {
                flatTactics.push({ id: ind.id, name: ind.name });
              });
          }
        });
        setTactics(flatTactics);
      }
    } catch (e) {
      console.error('Error fetching analytics data:', e);
    } finally {
      setLoading(false);
    }
  }, [API_URL, range, selectedTacticId, isUnplannedFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle session start/complete
  const handleSessionComplete = async (payload: {
    title: string;
    durationMinutes: number;
    tacticId?: number;
    tags: string[];
    outputSummary: string;
    reflectionNotes?: string;
  }) => {
    try {
      // Start session
      const startRes = await fetch(`${API_URL}/pomodoro/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          durationMinutes: payload.durationMinutes,
          tacticId: payload.tacticId,
          tags: payload.tags,
        }),
      });

      if (startRes.ok) {
        const session = await startRes.json();
        // Complete session
        await fetch(`${API_URL}/pomodoro/${session.id}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            outputSummary: payload.outputSummary,
            reflectionNotes: payload.reflectionNotes,
          }),
        });

        fetchData();
      }
    } catch (e) {
      console.error('Error recording pomodoro session:', e);
    }
  };

  // Handle Promote submit
  const handlePromoteSubmit = async (sessionId: number, tacticId: number) => {
    try {
      const res = await fetch(`${API_URL}/pomodoro/${sessionId}/promote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tacticId }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error('Error promoting session:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <main className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Title Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight text-white">
                  Pomodoro & Productivity Monitoring Analytics
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Realtime Monitoring
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Theo dõi kết quả thực sự từng ngày, phân tích mật độ Deep Work và kết nối chiến lược 12-Week Year.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Làm mới dữ liệu
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
            >
              Quay lại 12-Week Architect
            </Link>
          </div>
        </div>

        {/* Grid Layout: Timer Widget + Filter Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Column 1: Pomodoro Timer Widget */}
          <div className="lg:col-span-1">
            <PomodoroTimerWidget
              tactics={tactics}
              onSessionComplete={handleSessionComplete}
            />
          </div>

          {/* Column 2 & 3: GitHub Heatmap + Filter Bar + Daily Activity Feed */}
          <div className="lg:col-span-2 space-y-8">
            {/* Filter Bar */}
            <PomodoroFilterBar
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              selectedTacticId={selectedTacticId}
              onTacticChange={setSelectedTacticId}
              isUnplannedFilter={isUnplannedFilter}
              onUnplannedChange={setIsUnplannedFilter}
              tactics={tactics}
            />

            {/* GitHub Style Heatmap Grid */}
            <GitHubHeatmap
              range={range}
              onRangeChange={setRange}
              days={(heatmapData.days as unknown as React.ComponentProps<typeof GitHubHeatmap>['days']) || []}
              hourlyDistribution={(heatmapData.hourlyDistribution as unknown as React.ComponentProps<typeof GitHubHeatmap>['hourlyDistribution']) || []}
              totalFocusMinutes={heatmapData.totalMinutes || 0}
              totalSessions={heatmapData.totalSessions || 0}
            />


            {/* Shaded Daily Activity Feed */}
            <DailyActivityFeed
              days={dailyBreakdown}
              onPromoteClick={(session) => setPromoteSession(session)}
            />
          </div>
        </div>
      </main>

      {/* Promote Modal */}
      {promoteSession && (
        <PromoteModal
          isOpen={!!promoteSession}
          onClose={() => setPromoteSession(null)}
          sessionId={promoteSession.id}
          sessionTitle={promoteSession.title}
          tactics={tactics}
          onPromoteSubmit={handlePromoteSubmit}
        />
      )}
    </div>
  );
}
