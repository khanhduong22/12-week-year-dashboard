"use client";

import { useState, useEffect } from "react";
import { CountdownHeader } from "@/components/dashboard/CountdownHeader";
import { BscGrid } from "@/components/dashboard/BscGrid";
import { ScorecardChecklist, Tactic } from "@/components/dashboard/ScorecardChecklist";
import { EnergyChart } from "@/components/dashboard/EnergyChart";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tacticsRes, logsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`)
        ]);
        
        if (tacticsRes.ok) setTactics(await tacticsRes.json());
        if (logsRes.ok) setLogs(await logsRes.json());
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  // Calculate Weekly Scorecard (Lead Indicators)
  // For each tactic, calculate how many times it was completed vs total logs
  const totalLogs = logs.length;
  const tacticProgress = tactics.map(t => {
    const completedCount = logs.filter(log => 
      log.tactics?.some((lt) => lt.tacticId === t.id && lt.isCompleted)
    ).length;
    return {
      tacticId: t.id,
      completed: completedCount,
      total: totalLogs || 1, // Avoid division by zero
    };
  });

  // Calculate total score based on weights
  let totalPossibleWeight = 0;
  let earnedWeight = 0;
  
  if (totalLogs > 0) {
    tactics.forEach(t => {
      const progress = tacticProgress.find(p => p.tacticId === t.id);
      const completionRate = (progress?.completed || 0) / totalLogs;
      totalPossibleWeight += t.weight;
      earnedWeight += t.weight * completionRate;
    });
  }

  const score = totalPossibleWeight > 0 ? (earnedWeight / totalPossibleWeight) * 100 : 100;
  const isWarning = score < 85 && totalLogs > 0;

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        isWarning ? "bg-red-950/20" : "bg-zinc-950"
      }`}
    >
      <main className="max-w-6xl mx-auto p-6 pt-12 md:p-12 text-foreground">
        <div className="mb-8 space-y-2 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">12 Week Year Architect</h1>
            <p className="text-muted-foreground">
              Monitor your system, achieve your goals, and master your routines.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/config" className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm border border-white/10">
              Config
            </Link>
            <Link href="/log" className="bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-2 rounded-full font-bold shadow-sm transition-colors text-sm">
              Daily Log
            </Link>
          </div>
        </div>

        {isWarning && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-200 text-sm flex items-center">
            <span className="font-semibold mr-2">Warning:</span>
            Your Weekly Scorecard is below 85% ({Math.round(score)}%). You need to hit the gas!
          </div>
        )}

        <CountdownHeader currentWeek={3} totalWeeks={12} />

        <BscGrid tactics={tactics} logs={logs} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScorecardChecklist 
            tactics={tactics} 
            progress={tacticProgress} 
          />
          <EnergyChart logs={logs} />
        </div>
      </main>
    </div>
  );
}
