"use client";

import { useState, useEffect } from "react";
import { CountdownHeader } from "@/components/dashboard/CountdownHeader";
import { BscGrid } from "@/components/dashboard/BscGrid";
import {
  ScorecardChecklist,
  Tactic,
} from "@/components/dashboard/ScorecardChecklist";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
import { OnboardingTour } from "@/components/dashboard/OnboardingTour";
import Link from "next/link";
export type DailyLog = {
  id: number;
  sleepHours: number;
  energyLevel: number;
  createdAt: string;
  tactics: { tacticId: number; isCompleted: boolean }[];
};

export default function DashboardPage() {
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsRes, cyclesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles`),
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
            const diffTime = today.getTime() - startDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // If before start date, it's week 1.
            let week = Math.ceil((diffDays + 1) / 7);
            if (week < 1) week = 1;
            if (week > 12) week = 12;

            setCurrentWeek(week);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // Calculate Weekly Scorecard (Lead Indicators)
  // For each tactic, calculate how many times it was completed vs total logs
  const totalLogs = logs.length;
  const totalWeeks = Math.max(1, Math.ceil(totalLogs / 7));

  const tacticProgress = tactics.map((t) => {
    const completedCount = logs.filter((log) =>
      log.tactics?.some((lt) => lt.tacticId === t.id && lt.isCompleted),
    ).length;
    return {
      tacticId: t.id,
      completed: completedCount,
      total: t.targetCount || 7, // Provide target count for completeness
    };
  });

  // Calculate total score based on weights
  let totalPossibleWeight = 0;
  let earnedWeight = 0;

  if (totalLogs > 0) {
    tactics.forEach((t) => {
      const progress = tacticProgress.find((p) => p.tacticId === t.id);
      const targetPerWeek = t.targetCount || 7;
      const totalTarget = targetPerWeek * totalWeeks;
      const completionRate = Math.min(
        1,
        (progress?.completed || 0) / totalTarget,
      );

      totalPossibleWeight += t.weight;
      earnedWeight += t.weight * completionRate;
    });
  }

  const score =
    totalPossibleWeight > 0 ? (earnedWeight / totalPossibleWeight) * 100 : 100;
  const isWarning = score < 85 && totalLogs > 0;

  return (
    <div
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
              href="/about"
              className="text-zinc-400 hover:text-white px-3 py-2 text-sm transition-colors border border-transparent hover:border-zinc-800 rounded-full"
            >
              About
            </Link>
            <Link
              id="tour-config"
              href="/config"
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm border border-white/10"
            >
              Config
            </Link>
            <Link
              id="tour-log"
              href="/log"
              className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm"
            >
              Daily Log
            </Link>
          </div>
        </div>

        {isWarning && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-200 text-sm flex items-center">
            <span className="font-semibold mr-2">Warning:</span>
            Your Weekly Scorecard is below 85% ({Math.round(score)}%). You need
            to hit the gas!
          </div>
        )}

        <CountdownHeader currentWeek={currentWeek} totalWeeks={12} />

        <div id="tour-bsc">
          <BscGrid tactics={tactics} logs={logs} />
        </div>

        <div
          id="tour-scorecard"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          <ScorecardChecklist tactics={tactics} progress={tacticProgress} />
          <EnergyChart logs={logs} />
        </div>

        <OnboardingTour />
      </main>
    </div>
  );
}
