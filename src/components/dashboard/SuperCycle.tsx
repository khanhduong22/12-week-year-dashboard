"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function SuperCycle() {
  const [passedDays, setPassedDays] = useState(0);
  const goal = 1000;

  useEffect(() => {
    const startDate = new Date("2025-01-29T00:00:00");
    const today = new Date();
    // Normalize to midnight to avoid time-of-day differences
    const normStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const normToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    
    const diffTime = normToday - normStart;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    setPassedDays(diffDays >= 0 ? diffDays : 0);
  }, []);

  const remainingDays = goal - passedDays;
  const progressPercent = Math.min(100, Math.max(0, (passedDays / goal) * 100));

  return (
    <div className="mb-8 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 shadow-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-emerald-400 flex items-center gap-2">
            <span>⚡️</span> Super Cycle 1000
          </h2>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Started: Jan 29, 2025
          </p>
        </div>
        <div className="mt-4 sm:mt-0 text-left sm:text-right">
          <div className="text-3xl font-black text-white">
            {passedDays} <span className="text-lg text-zinc-500 font-medium">/ {goal} days</span>
          </div>
          <p className="text-xs text-emerald-500/80 font-bold tracking-wide uppercase mt-1">
            {remainingDays} days remaining
          </p>
        </div>
      </div>
      
      <Progress value={progressPercent} className="h-3 bg-zinc-950 [&>div]:bg-emerald-500" />
      
      <div className="flex justify-between mt-2 text-xs font-semibold text-zinc-500">
        <span>0%</span>
        <span className="text-emerald-400/70">{progressPercent.toFixed(1)}% Completed</span>
        <span>100%</span>
      </div>
    </div>
  );
}
