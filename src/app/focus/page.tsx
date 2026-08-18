'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, BarChart2 } from 'lucide-react';
import { FocusSidebar, SmartViewType } from '@/components/focustodo/FocusSidebar';
import { TopMetricsBar } from '@/components/focustodo/TopMetricsBar';
import { InlineTaskInput } from '@/components/focustodo/InlineTaskInput';
import { FocusTaskList, TaskItem } from '@/components/focustodo/FocusTaskList';
import { PersistentBottomTimerBar } from '@/components/focustodo/PersistentBottomTimerBar';
import { FocusSettingsModal } from '@/components/focustodo/FocusSettingsModal';

import { useAuthFetch } from '@/lib/useAuthFetch';

interface TacticItem {
  id: number;
  name: string;
}

interface GoalItem {
  id: number;
  name: string;
  category?: string;
  tactics?: TacticItem[];
}

export default function FocusPage() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<SmartViewType | string>('today');
  const [selectedTacticId, setSelectedTacticId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const authFetch = useAuthFetch();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tasks & Metrics State
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [metrics, setMetrics] = useState<{
    estimatedTimeText: string;
    elapsedTimeText: string;
    pendingCount: number;
    completedCount: number;
  }>({
    estimatedTimeText: '0m',
    elapsedTimeText: '0m',
    pendingCount: 0,
    completedCount: 0,
  });

  // Goals & Tactics
  const [goals, setGoals] = useState<GoalItem[]>([]);

  // Active Timer Task
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  // Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      let queryStr = '';
      if (activeView.startsWith('tactic_')) {
        queryStr = `tacticId=${selectedTacticId}`;
      } else {
        queryStr = `smartView=${activeView}`;
      }

      const res = await authFetch(`${API_URL}/tasks?${queryStr}`);
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        setTasks(data.tasks || []);
        setMetrics({
          estimatedTimeText: data.metrics?.estimatedTimeText || '0m',
          elapsedTimeText: data.metrics?.elapsedTimeText || '0m',
          pendingCount: data.metrics?.pendingCount || 0,
          completedCount: data.metrics?.completedCount || 0,
        });
      }

      // Fetch Goals for sidebar from active cycle endpoint
      const cyclesRes = await authFetch(`${API_URL}/cycles/active-public`);
      if (cyclesRes.ok) {
        const text = await cyclesRes.text();
        const activeCycle = text ? JSON.parse(text) : null;
        if (activeCycle && activeCycle.goals) {
          setGoals(activeCycle.goals);
        }
      }
    } catch (e) {
      console.error('Error fetching tasks:', e);
    } finally {
      setLoading(false);
    }
  }, [API_URL, activeView, authFetch, selectedTacticId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSelectView = (view: SmartViewType | string, tacticId?: number) => {
    setActiveView(view);
    setSelectedTacticId(tacticId);
  };

  const handleAddTask = async (payload: {
    title: string;
    estimatedPomodoros: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    tacticId?: number;
  }) => {
    try {
      const res = await authFetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: payload.title,
          estimatedPomodoros: payload.estimatedPomodoros,
          priority: payload.priority,
          tacticId: payload.tacticId || selectedTacticId,
        }),
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error('Error creating task:', e);
    }
  };

  const handleToggleComplete = async (task: TaskItem) => {
    try {
      const res = await authFetch(`${API_URL}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !task.isCompleted }),
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error('Error toggling task completion:', e);
    }
  };

  const handleStartTimer = (task: TaskItem) => {
    setActiveTask(task);
  };

  const handleDeleteTask = async (id: number) => {
    try {
      const res = await authFetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchTasks();
      }
    } catch (e) {
      console.error('Error deleting task:', e);
    }
  };

  const handleSessionFinish = async (payload: { outputSummary: string }) => {
    if (!activeTask) return;
    try {
      // Increment task elapsed pomodoros
      await authFetch(`${API_URL}/tasks/${activeTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elapsedPomodoros: activeTask.elapsedPomodoros + 1 }),
      });

      // Log Pomodoro session
      const startRes = await authFetch(`${API_URL}/pomodoro/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeTask.title,
          durationMinutes: 25,
          tacticId: activeTask.tactic?.id,
        }),
      });

      if (startRes.ok) {
        const text = await startRes.text();
        const session = text ? JSON.parse(text) : null;
        if (session && session.id) {
          await authFetch(`${API_URL}/pomodoro/${session.id}/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ outputSummary: payload.outputSummary }),
          });
        }
      }

      fetchTasks();
    } catch (e) {
      console.error('Error saving pomodoro finish:', e);
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'today':
        return 'Today';
      case 'tomorrow':
        return 'Tomorrow';
      case 'this_week':
        return 'This Week';
      case 'planned':
        return 'Planned';
      case 'completed':
        return 'Completed';
      default:
        return 'Tasks';
    }
  };

  if (!mounted) return null;

  return (
    <div suppressHydrationWarning className="flex h-screen bg-[#0f0f15] text-slate-100 overflow-hidden">
      {/* Left Focus Sidebar */}
      <FocusSidebar
        activeView={activeView}
        onSelectView={handleSelectView}
        goals={goals}
        counts={{
          today: tasks.length,
          this_week: tasks.length,
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content View Area */}
      <main className="flex-1 flex flex-col justify-between overflow-y-auto p-6 md:p-8 space-y-6 pb-24">
        <div className="space-y-6 max-w-5xl mx-auto w-full">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl bg-[#181824] text-slate-400 hover:text-white border border-slate-800"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-2xl font-black tracking-tight text-white capitalize">
                {getViewTitle()}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={fetchTasks}
                disabled={loading}
                className="p-2 rounded-xl bg-[#181824] text-slate-400 hover:text-white border border-slate-800"
                title="Refresh tasks"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/pomodoro-analytics"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30"
              >
                <BarChart2 className="w-3.5 h-3.5" />
                Analytics Heatmap
              </Link>
            </div>
          </div>

          {/* Top Metrics Bar */}
          <TopMetricsBar
            estimatedTimeText={metrics.estimatedTimeText}
            tasksToBeCompleted={metrics.pendingCount}
            elapsedTimeText={metrics.elapsedTimeText}
            completedTasks={metrics.completedCount}
          />

          {/* Inline Quick Task Creator */}
          <InlineTaskInput
            onAddTask={handleAddTask}
            tactics={goals.flatMap((g) => g.tactics || [])}
            currentViewLabel={getViewTitle()}
          />

          {/* Task List */}
          <FocusTaskList
            tasks={tasks}
            activeTaskId={activeTask?.id}
            onToggleComplete={handleToggleComplete}
            onStartTimer={handleStartTimer}
            onDeleteTask={handleDeleteTask}
          />
        </div>
      </main>

      {/* Floating Bottom Pomodoro Control Bar */}
      <PersistentBottomTimerBar
        activeTask={activeTask}
        onSessionFinish={handleSessionFinish}
      />

      {/* Focus Settings Modal */}

      <FocusSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
