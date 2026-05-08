import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

export type Tactic = { 
  id: number; 
  name: string; 
  category: string; 
  weight: number; 
  targetCount?: number;
  indicatorType?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
};
export type TacticProgress = { tacticId: number; completed: number; total: number };

interface ScorecardChecklistProps {
  tactics: Tactic[];
  progress: TacticProgress[];
}

export function ScorecardChecklist({ tactics, progress }: ScorecardChecklistProps) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg relative overflow-visible z-10">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Weekly Scorecard Progress
          <div className="group relative flex items-center">
            <Info className="w-4 h-4 text-zinc-400 hover:text-white cursor-help transition-colors" />
            <div className="absolute left-0 bottom-full mb-2 w-[320px] p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-zinc-300 normal-case tracking-normal">
              <p className="font-bold text-white mb-2 text-sm">Chấm điểm 12WY (Strict Scoring):</p>
              <p className="mb-2">12 Week Year <strong>không có điểm vớt (partial credit)</strong>. Bạn chỉ có Đạt (100%) hoặc Thất bại (0%).</p>
              <ul className="space-y-1 list-disc pl-4 text-zinc-400">
                <li>Thanh Progress Bar giúp bạn tracking tiến độ hàng ngày (ví dụ: đã đi bộ 3/7 ngày).</li>
                <li>Đến cuối tuần, nếu thanh Progress không đạt mức tối đa, Tactic đó bị tính là 0 điểm. Cố lên nhé!</li>
              </ul>
            </div>
          </div>
          <span className="text-xs font-normal text-muted-foreground ml-auto bg-secondary px-2 py-1 rounded-md">
            Lead Indicators
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {tactics.length === 0 ? (
          <div className="text-sm text-zinc-500">No tactics configured. Go to Config to add some.</div>
        ) : (
          tactics.map((tactic) => {
            const p = progress.find(p => p.tacticId === tactic.id);
            const completed = p?.completed || 0;
            const target = tactic.targetCount || 7;
            const percentage = Math.min(Math.round((completed / target) * 100), 100);
            
            return (
              <div key={tactic.id} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-zinc-200">{tactic.name}</span>
                  <span className="text-emerald-400">{completed}/{target} days</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
