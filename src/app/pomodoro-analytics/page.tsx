'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Flame } from 'lucide-react';
import { useAuthFetch } from '@/lib/useAuthFetch';
import { OverviewMetricsCards, OverviewMetricsProps } from '@/components/focustodo-analytics/OverviewMetricsCards';
import { PomodoroRecordsMatrix, MatrixDay } from '@/components/focustodo-analytics/PomodoroRecordsMatrix';
import { ProjectTimeDistribution, DistributionItem } from '@/components/focustodo-analytics/ProjectTimeDistribution';
import { FocusGoalCalendar, CalendarDayItem } from '@/components/focustodo-analytics/FocusGoalCalendar';
import { FocusTrendCharts, TrendPoint } from '@/components/focustodo-analytics/FocusTrendCharts';
import { DailyActivityFeed, ActivitySession, DailyBreakdownDay } from '@/components/pomodoro/DailyActivityFeed';
import { PromoteModal } from '@/components/pomodoro/PromoteModal';

interface TacticRaw {
  id?: number;
  name?: string;
  tactics?: Array<{ id: number; name: string }>;
}

export default function PomodoroAnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const authFetch = useAuthFetch();

  // Data States
  const [overviewMetrics, setOverviewMetrics] = useState<OverviewMetricsProps>({});
  const [matrixDays, setMatrixDays] = useState<MatrixDay[]>([]);
  const [distribution, setDistribution] = useState<DistributionItem[]>([]);
  const [calendarData, setCalendarData] = useState<{
    targetHours?: number;
    focusDaysCount?: number;
    completedGoalDaysCount?: number;
    completionRate?: number;
    calendarDays?: CalendarDayItem[];
  }>({});
  const [trendData, setTrendData] = useState<{
    focusStats?: { topMinutes: number; avgMinutes: number; totalMinutes: number };
    taskStats?: { topTasks: number; avgTasks: number; totalTasks: number };
    series?: TrendPoint[];
  }>({});

  const [dailyBreakdown, setDailyBreakdown] = useState<DailyBreakdownDay[]>([]);
  const [tactics, setTactics] = useState<Array<{ id: number; name: string }>>([]);

  // Promote Modal
  const [promoteSession, setPromoteSession] = useState<ActivitySession | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Overview Metrics
      const overviewRes = await authFetch(`${API_URL}/analytics/overview-metrics`);
      if (overviewRes.ok) {
        const text = await overviewRes.text();
        if (text) setOverviewMetrics(JSON.parse(text));
      }

      // 2. Heatmap & Records Matrix
      const heatmapRes = await authFetch(`${API_URL}/analytics/heatmap?range=month`);
      if (heatmapRes.ok) {
        const text = await heatmapRes.text();
        if (text) {
          const json = JSON.parse(text);
          setMatrixDays(json.days || []);
        }
      }

      // 3. Project Distribution
      const distRes = await authFetch(`${API_URL}/analytics/project-distribution?timeframe=monthly`);
      if (distRes.ok) {
        const text = await distRes.text();
        if (text) {
          const json = JSON.parse(text);
          setDistribution(json.distribution || []);
        }
      }

      // 4. Goal Calendar
      const calRes = await authFetch(`${API_URL}/analytics/goal-calendar?targetHours=3`);
      if (calRes.ok) {
        const text = await calRes.text();
        if (text) setCalendarData(JSON.parse(text));
      }

      // 5. Trend Charts
      const trendRes = await authFetch(`${API_URL}/analytics/trend-charts?timeframe=daily`);
      if (trendRes.ok) {
        const text = await trendRes.text();
        if (text) setTrendData(JSON.parse(text));
      }

      // 6. Daily Breakdown Activity Feed
      const breakdownRes = await authFetch(`${API_URL}/analytics/daily-breakdown`);
      if (breakdownRes.ok) {
        const text = await breakdownRes.text();
        if (text) {
          const json = JSON.parse(text);
          setDailyBreakdown(json.days || []);
        }
      }

      // 7. Tactics list for promote modal
      const tacticsRes = await authFetch(`${API_URL}/tactics`);
      if (tacticsRes.ok) {
        const text = await tacticsRes.text();
        if (text) {
          const data: TacticRaw[] = JSON.parse(text);
          const flatTactics: Array<{ id: number; name: string }> = [];
          (data || []).forEach((item) => {
            if (item.tactics) flatTactics.push(...item.tactics);
            else if (item.id && item.name) flatTactics.push({ id: item.id, name: item.name });
          });
          setTactics(flatTactics);
        }
      }
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoading(false);
    }
  }, [API_URL, authFetch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDistributionTimeframe = async (tf: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    try {
      const res = await authFetch(`${API_URL}/analytics/project-distribution?timeframe=${tf}`);
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const json = JSON.parse(text);
          setDistribution(json.distribution || []);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrendTimeframe = async (tf: 'daily' | 'weekly' | 'monthly') => {
    try {
      const res = await authFetch(`${API_URL}/analytics/trend-charts?timeframe=${tf}`);
      if (res.ok) {
        const text = await res.text();
        if (text) setTrendData(JSON.parse(text));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePromoteSubmit = async (sessionId: number, tacticId: number) => {
    try {
      const res = await authFetch(`${API_URL}/pomodoro/${sessionId}/promote`, {
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

  if (!mounted) return null;

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[#0f0f15] text-slate-100 p-6 md:p-10 space-y-8 select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/focus"
              className="p-2.5 rounded-xl bg-[#181824] text-slate-400 hover:text-white border border-slate-800 transition-all hover:scale-105"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500 fill-current" />
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Focus To-Do Statistics & Monitoring
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deep work analytics, project distribution & 12-Week Goal execution trends
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[#181824] text-slate-400 hover:text-white border border-slate-800 transition-all"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/focus"
              className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs shadow-lg shadow-rose-500/20 transition-all"
            >
              🍅 Open Focus Mode
            </Link>
          </div>
        </div>

        {/* Panel 1: Top 6 Overview Metric Cards */}
        <OverviewMetricsCards
          totalFocusMinutes={overviewMetrics.totalFocusMinutes}
          weekFocusMinutes={overviewMetrics.weekFocusMinutes}
          todayFocusMinutes={overviewMetrics.todayFocusMinutes}
          totalCompletedTasks={overviewMetrics.totalCompletedTasks}
          weekCompletedTasks={overviewMetrics.weekCompletedTasks}
          todayCompletedTasks={overviewMetrics.todayCompletedTasks}
        />

        {/* Panel 2: Pomodoro Records Matrix */}
        <PomodoroRecordsMatrix days={matrixDays} />

        {/* Panel 3 & 4: Project Time Distribution + Focus Goal Calendar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProjectTimeDistribution
            distribution={distribution}
            onTimeframeChange={handleDistributionTimeframe}
          />
          <FocusGoalCalendar
            targetHours={calendarData.targetHours}
            focusDaysCount={calendarData.focusDaysCount}
            completedGoalDaysCount={calendarData.completedGoalDaysCount}
            completionRate={calendarData.completionRate}
            calendarDays={calendarData.calendarDays}
          />
        </div>

        {/* Panel 5: Focus Time & Task Trend Charts */}
        <FocusTrendCharts
          focusStats={trendData.focusStats}
          taskStats={trendData.taskStats}
          series={trendData.series}
          onTimeframeChange={handleTrendTimeframe}
        />

        {/* Panel 6: Daily Activity Breakdown Feed & Promote Modal */}
        <div className="border-t border-slate-800/80 pt-6">
          <DailyActivityFeed
            days={dailyBreakdown}
            onPromoteClick={(session) => setPromoteSession(session)}
          />
        </div>


        <PromoteModal
          isOpen={!!promoteSession}
          sessionId={promoteSession?.id || 0}
          sessionTitle={promoteSession?.title || ''}
          tactics={tactics}
          onClose={() => setPromoteSession(null)}
          onPromoteSubmit={handlePromoteSubmit}
        />

      </div>
    </div>
  );
}
