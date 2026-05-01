"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const data = [
  { day: "Mon", energy: 8, sleep: 7.5 },
  { day: "Tue", energy: 7, sleep: 6.0 },
  { day: "Wed", energy: 9, sleep: 8.0 },
  { day: "Thu", energy: 6, sleep: 5.5 },
  { day: "Fri", energy: 8, sleep: 7.0 },
  { day: "Sat", energy: 10, sleep: 9.0 },
  { day: "Sun", energy: 9, sleep: 8.5 },
];

export function EnergyChart() {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Energy & Bio-metric Chart</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
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
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }}
              itemStyle={{ color: "#e4e4e7" }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
            <Line 
              type="monotone" 
              dataKey="energy" 
              name="Energy Level (1-10)"
              stroke="#3b82f6" 
              strokeWidth={2} 
              dot={{ r: 4, fill: "#3b82f6" }} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              dataKey="sleep" 
              name="Sleep Duration (hrs)"
              stroke="#8b5cf6" 
              strokeWidth={2} 
              dot={{ r: 4, fill: "#8b5cf6" }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
