import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Tactic = { id: number; name: string; category: string; weight: number };
export type TacticProgress = { tacticId: number; completed: number; total: number };

interface ScorecardChecklistProps {
  tactics: Tactic[];
  progress: TacticProgress[];
}

export function ScorecardChecklist({ tactics, progress }: ScorecardChecklistProps) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Weekly Scorecard Progress
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
            const total = p?.total || 1;
            const percentage = Math.round((completed / total) * 100);
            
            return (
              <div key={tactic.id} className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-zinc-200">{tactic.name}</span>
                  <span className="text-emerald-400">{completed}/{total} days</span>
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
