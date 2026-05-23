"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import type { DailyLog, Tactic } from "@/app/dashboard/page";

interface EnergyChartProps {
  logs: DailyLog[];
  tactics: Tactic[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  activeCycle: any;
}

export function EnergyChart({ logs, tactics, activeCycle }: EnergyChartProps) {
  const [activeTab, setActiveTab] = useState<"execution" | "biometrics">("execution");

  // Format logs for daily biometrics chart. Sort by createdAt ascending.
  const sortedLogs = [...logs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  const dailyData = sortedLogs.map((log) => {
    const d = new Date(log.date || log.createdAt);
    const day = d.toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' });
    return {
      day,
      energy: log.energyLevel,
      sleep: log.sleepHours,
      weight: log.weight,
      bodyFat: log.bodyFat,
    };
  });

  // Calculate weekly execution score trend for all 12 weeks
  const getWeeklyData = () => {
    if (!activeCycle || tactics.length === 0) return [];

    const start = new Date(activeCycle.startDate);
    const normStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    
    const weeksData = [];
    const totalWeeks = 12;
    const today = new Date();
    const normToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();

    const tacticsWithLeads = tactics.filter(t => (t.indicators || []).some(i => i.type === "LEAD"));

    for (let w = 1; w <= totalWeeks; w++) {
      const weekStartMs = normStart + (w - 1) * 7 * 24 * 60 * 60 * 1000;
      const weekEndMs = normStart + w * 7 * 24 * 60 * 60 * 1000;

      // Filter logs for this week
      const weekLogs = logs.filter(log => {
        const logDate = new Date(log.date || log.createdAt);
        const normLog = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate()).getTime();
        return normLog >= weekStartMs && normLog < weekEndMs;
      });

      // Calculate execution for each tactic
      let totalExpected = 0;
      let totalCompleted = 0;
      const tacticScores: Record<string, number | null> = {};

      const hasLogs = weekLogs.length > 0;
      const isFutureWeek = weekStartMs > normToday;

      tacticsWithLeads.forEach(t => {
        const leadInds = (t.indicators || []).filter(i => i.type === "LEAD");
        
        const expected = leadInds.reduce((sum, ind) => sum + (ind.targetCount || 7), 0);
        const completed = leadInds.reduce((sum, ind) => {
          const count = weekLogs.filter(log =>
            log.indicators?.some(li => li.indicatorId === ind.id && li.isCompleted)
          ).length;
          return sum + Math.min(count, ind.targetCount || 7);
        }, 0);

        const tacticScore = expected > 0 ? Math.round((completed / expected) * 100) : 100;

        if (isFutureWeek && !hasLogs) {
          tacticScores[t.name] = null;
        } else {
          tacticScores[t.name] = tacticScore;
        }

        totalExpected += expected;
        totalCompleted += completed;
      });

      const overallScore = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 100;

      if (isFutureWeek && !hasLogs) {
        weeksData.push({
          name: `Week ${w}`,
          Overall: null,
          ...tacticScores
        });
      } else {
        weeksData.push({
          name: `Week ${w}`,
          Overall: overallScore,
          ...tacticScores
        });
      }
    }
    return weeksData;
  };

  const weeklyData = getWeeklyData();
  const tacticsWithLeads = tactics.filter(t => (t.indicators || []).some(i => i.type === "LEAD"));
  const tacticColors = ["#3b82f6", "#a855f7", "#f59e0b", "#ec4899", "#14b8a6", "#ef4444"];

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <span>{activeTab === "execution" ? "Weekly Execution Progress" : "Bio-metric & Energy Chart"}</span>
        </CardTitle>
        <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-0.5 text-xs font-semibold shrink-0">
          <button 
            onClick={() => setActiveTab("execution")}
            className={`px-3 py-1 rounded-md transition-all ${activeTab === "execution" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Execution
          </button>
          <button 
            onClick={() => setActiveTab("biometrics")}
            className={`px-3 py-1 rounded-md transition-all ${activeTab === "biometrics" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
          >
            Bio-metrics
          </button>
        </div>
      </CardHeader>
      <CardContent className="h-[320px] w-full pb-4">
        {activeTab === "execution" ? (
          weeklyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
              No active cycle found.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}
                  itemStyle={{ color: "#e4e4e7" }}
                  formatter={(value) => [`${value}%`]}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                
                {/* Thick primary line for Overall execution score */}
                <Line 
                  type="monotone" 
                  dataKey="Overall" 
                  name="Overall Score"
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: "#10b981" }} 
                  activeDot={{ r: 7 }} 
                />

                {/* Individual tactics execution trend */}
                {tacticsWithLeads.map((t, idx) => (
                  <Line 
                    key={t.id}
                    type="monotone" 
                    dataKey={t.name}
                    stroke={tacticColors[idx % tacticColors.length]} 
                    strokeWidth={1.5} 
                    dot={{ r: 3, fill: tacticColors[idx % tacticColors.length] }} 
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )
        ) : (
          dailyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
              No logs recorded yet. Start logging to see your bio-metrics!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#888888" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.5)" }}
                  itemStyle={{ color: "#e4e4e7" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="energy" 
                  name="Energy (1-10)"
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: "#3b82f6" }} 
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="sleep" 
                  name="Sleep (hrs)"
                  stroke="#8b5cf6" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: "#8b5cf6" }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="weight" 
                  name="Weight"
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: "#10b981" }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="bodyFat" 
                  name="Body Fat %"
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={{ r: 4, fill: "#f59e0b" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          )
        )}
      </CardContent>
    </Card>
  );
}
