"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import type { DailyLog } from "@/app/dashboard/page";

interface EnergyChartProps {
  logs: DailyLog[];
}

export function EnergyChart({ logs }: EnergyChartProps) {
  // Format logs for chart. Sort by createdAt ascending.
  const sortedLogs = [...logs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  
  // Map to chart format. If no logs, we can just return empty or a small placeholder
  const data = sortedLogs.map((log) => {
    const d = new Date(log.createdAt);
    const day = d.toLocaleDateString("en-US", { weekday: 'short' });
    return {
      day,
      energy: log.energyLevel,
      sleep: log.sleepHours,
      weight: log.weight,
      bodyFat: log.bodyFat,
    };
  });

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>Bio-metric & Energy Chart</span>
          <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-md">
            Trends
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        {data.length === 0 ? (
           <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
             No logs recorded yet. Start logging to see your bio-metrics!
           </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="day" 
                stroke="#888888" 
                fontSize={12} 
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
                contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
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
        )}
      </CardContent>
    </Card>
  );
}
