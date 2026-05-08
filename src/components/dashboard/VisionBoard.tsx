import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp } from "lucide-react";
import type { Tactic } from "./ScorecardChecklist";

interface VisionBoardProps {
  lagTactics: Tactic[];
}

export function VisionBoard({ lagTactics }: VisionBoardProps) {
  if (lagTactics.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {lagTactics.map((tactic) => {
        const targetValue = tactic.targetValue || 0;
        const currentValue = tactic.currentValue || 0;
        const unit = tactic.unit || "";
        const percentage = targetValue > 0 
          ? Math.min(Math.round((currentValue / targetValue) * 100), 100) 
          : 0;

        return (
          <Card key={tactic.id} className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold flex items-start justify-between gap-4">
                <span className="text-zinc-100 leading-tight">{tactic.name}</span>
                <Target className="w-5 h-5 text-indigo-400 shrink-0" />
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  {tactic.category}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Lag Indicator
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex items-end justify-between mb-2">
                <div>
                  <div className="text-3xl font-black text-white tracking-tight">
                    {currentValue} <span className="text-base font-medium text-zinc-500">{unit}</span>
                  </div>
                  <div className="text-sm text-zinc-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Target: {targetValue} {unit}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-indigo-400">{percentage}%</span>
                </div>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
