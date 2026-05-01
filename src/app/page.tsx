"use client";

import { useState } from "react";
import { CountdownHeader } from "@/components/dashboard/CountdownHeader";
import { BscGrid } from "@/components/dashboard/BscGrid";
import { ScorecardChecklist, ChecklistState } from "@/components/dashboard/ScorecardChecklist";
import { EnergyChart } from "@/components/dashboard/EnergyChart";

export default function DashboardPage() {
  const [checklist, setChecklist] = useState<ChecklistState>({
    sleep: false,
    snack: false,
    study: false,
    exercise: false,
  });

  const toggleChecklist = (key: keyof ChecklistState) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const totalItems = Object.keys(checklist).length;
  const score = (checkedCount / totalItems) * 100;

  // Conditional Styling: Tone đỏ cảnh báo nếu < 85%
  const isWarning = score < 85;

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        isWarning ? "bg-red-950/20" : "bg-zinc-950"
      }`}
    >
      <main className="max-w-6xl mx-auto p-6 pt-12 md:p-12 text-foreground">
        <div className="mb-8 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">12 Week Year Architect</h1>
          <p className="text-muted-foreground">
            Monitor your system, achieve your goals, and master your routines.
          </p>
        </div>

        {isWarning && (
          <div className="mb-6 p-4 rounded-lg bg-red-900/30 border border-red-500/30 text-red-200 text-sm flex items-center">
            <span className="font-semibold mr-2">Warning:</span>
            Your Weekly Scorecard is below 85%. You need to hit the gas!
          </div>
        )}

        <CountdownHeader currentWeek={3} totalWeeks={12} />

        <BscGrid />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScorecardChecklist checklist={checklist} onToggle={toggleChecklist} />
          <EnergyChart />
        </div>
      </main>
    </div>
  );
}
