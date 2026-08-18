"use client";

import { useState, useEffect } from "react";
import { CountdownHeader } from "@/components/dashboard/CountdownHeader";
import { SuperCycle } from "@/components/dashboard/SuperCycle";
import { BscGrid } from "@/components/dashboard/BscGrid";
import { VisionBoard } from "@/components/dashboard/VisionBoard";
import { ScorecardChecklist } from "@/components/dashboard/ScorecardChecklist";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
import { OnboardingTour } from "@/components/dashboard/OnboardingTour";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useAuthFetch } from "@/lib/useAuthFetch";

export type Indicator = {
  id: number;
  name: string;
  type: string;
  targetCount?: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
};

export type Tactic = { 
  id: number; 
  name: string; 
  category: string; 
  weight: number; 
  indicators: Indicator[];
};

export type DailyLog = {
  id: number;
  sleepHours: number;
  energyLevel: number;
  weight?: number;
  bodyFat?: number;
  createdAt: string;
  date?: string;
  indicators: { indicatorId: number; isCompleted: boolean }[];
};

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const authFetch = useAuthFetch();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDay, setCurrentDay] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeCycle, setActiveCycle] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session) return;

      try {
        const [logsRes, cyclesRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`),
          authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles`),
        ]);

        if (logsRes.ok) setLogs(await logsRes.json());

        if (cyclesRes.ok) {
          const cycles = await cyclesRes.json();
          const activeCycle =
            cycles.find((c: { isActive: boolean }) => c.isActive) || cycles[0];
          if (activeCycle) {
            setTactics(
              activeCycle.tactics.sort(
                (a: { weight: number }, b: { weight: number }) =>
                  b.weight - a.weight,
              ),
            );
            const startDate = new Date(activeCycle.startDate);
            const today = new Date();
            const normStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
            const normToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
            
            const diffTime = normToday - normStart;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // If before start date, it's week 1.
            let week = Math.floor(diffDays / 7) + 1;
            let day = (diffDays % 7) + 1;
            
            if (diffDays < 0) {
              week = 1;
              day = 1;
            } else if (week > 12) {
              week = 12;
              day = 7;
            }

            setCurrentWeek(week);
            setCurrentDay(day);
            setActiveCycle(activeCycle);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [session, status, authFetch]);

  // Separate Indicators
  const lagIndicators = tactics.flatMap(t => 
    (t.indicators || []).filter(i => i.type === "LAG").map(i => ({ ...i, tacticName: t.name, category: t.category }))
  );
  
  // Calculate Weekly Scorecard (Lead Indicators)
  // Filter logs for the CURRENT week only
  const currentWeekLogs = logs.filter(log => {
    if (!activeCycle) return false;
    const startDate = new Date(activeCycle.startDate);
    const normStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    
    const logDate = new Date(log.date || log.createdAt);
    const normLog = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).getTime();
    
    if (normLog < normStart) return false;
    
    const diffDays = Math.floor((normLog - normStart) / (1000 * 60 * 60 * 24));
    const logWeek = Math.floor(diffDays / 7) + 1;
    
    return logWeek === currentWeek;
  });

  // Calculate total score based on all lead indicators in the current week (unweighted action-based scoring)
  let totalExpectedActions = 0;
  let totalCompletedActions = 0;

  const tacticsWithLeads = tactics.filter(t => (t.indicators || []).some(i => i.type === "LEAD"));

  tacticsWithLeads.forEach((t) => {
    const leadInds = (t.indicators || []).filter(i => i.type === "LEAD");
    leadInds.forEach((ind) => {
      const target = ind.targetCount || 7;
      const completed = currentWeekLogs.filter((log) => 
        log.indicators?.some((li) => li.indicatorId === ind.id && li.isCompleted)
      ).length;
      
      totalExpectedActions += target;
      totalCompletedActions += Math.min(completed, target);
    });
  });

  const score = totalExpectedActions > 0 ? (totalCompletedActions / totalExpectedActions) * 100 : 100;
  const isWarning = score < 85 && currentWeekLogs.length > 0;

  if (!mounted) return null;

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen transition-colors duration-700 ${
        isWarning ? "bg-red-950/20" : "bg-zinc-950"
      }`}
    >

      <main className="max-w-6xl mx-auto p-6 pt-12 md:p-12 text-foreground">
        <div className="mb-8 space-y-4 flex flex-col md:flex-row md:justify-between md:items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              12 Week Year Architect
            </h1>
            <p className="text-muted-foreground">
              Monitor your system, achieve your goals, and master your routines.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("start-tour"))
              }
              className="text-zinc-400 hover:text-white px-3 py-2 text-sm transition-colors border border-transparent hover:border-zinc-800 rounded-full"
            >
              Take a Tour
            </button>
            <Link
              id="tour-about"
              href="/"
              className="text-zinc-400 hover:text-white px-3 py-2 text-sm transition-colors border border-transparent hover:border-zinc-800 rounded-full"
            >
              Theory & About
            </Link>
            <Link
              id="tour-config"
              href="/config"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm border border-white/10"
            >
              Config
            </Link>
            <Link
              id="tour-history"
              href="/history"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm border border-white/10"
            >
              History
            </Link>
            <Link
              href="/focus"
              className="bg-rose-500 hover:bg-rose-400 text-zinc-950 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm shadow-rose-500/20 flex items-center gap-1.5"
            >
              🍅 Focus To-Do Mode
            </Link>
            <Link
              href="/pomodoro-analytics"
              className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm shadow-emerald-500/20 flex items-center gap-1.5"
            >
              ⏱️ Pomodoro Analytics
            </Link>

            <Link
              id="tour-log"
              href="/log"
              className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm"
            >
              Daily Log
            </Link>

            <button
              onClick={() => {
                import('next-auth/react').then(({ signOut }) => signOut());
              }}
              className="text-zinc-400 hover:text-red-400 px-3 py-2 text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {isWarning && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-200 text-sm flex items-center">
            <span className="font-semibold mr-2">Warning:</span>
            Your Weekly Scorecard is below 85% ({Math.round(score)}%). You need
            to hit the gas!
          </div>
        )}

        <SuperCycle />

        <CountdownHeader currentWeek={currentWeek} totalWeeks={12} currentDay={currentDay} />

        {/* Vision Board for Lag Indicators */}
        <div id="tour-vision">
          <VisionBoard lagIndicators={lagIndicators} />
        </div>

        <div id="tour-bsc">
          {activeCycle && (
            <BscGrid 
              tactics={tactics} 
              logs={logs} 
              currentWeek={currentWeek} 
              startDate={activeCycle.startDate} 
            />
          )}
        </div>

        <div
          id="tour-scorecard"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <ScorecardChecklist tactics={tacticsWithLeads} currentWeekLogs={currentWeekLogs} />
          <EnergyChart logs={logs} tactics={tactics} activeCycle={activeCycle} />
        </div>

        <OnboardingTour />
      </main>
    </div>
  );
}
