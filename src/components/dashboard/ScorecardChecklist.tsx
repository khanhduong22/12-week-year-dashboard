import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";

import type { Tactic, DailyLog } from "@/app/dashboard/page";

interface ScorecardChecklistProps {
  tactics: Tactic[];
  currentWeekLogs: DailyLog[];
}

export function ScorecardChecklist({ tactics, currentWeekLogs }: ScorecardChecklistProps) {
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
                <li>Thanh Progress Bar giúp bạn tracking tiến độ của từng chỉ số hành động Lead Indicator.</li>
                <li>Đến cuối tuần, nếu một Lead Indicator chưa đạt chỉ tiêu (ví dụ: 3/5), Tactic của nó sẽ bị tính là 0 điểm khi tính Execution Score tổng. Cố lên nhé!</li>
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
            const leads = (tactic.indicators || []).filter(i => i.type === "LEAD");
            if (leads.length === 0) return null;

            return (
              <div key={tactic.id} className="space-y-3 p-4 rounded-xl bg-zinc-900/20 border border-white/5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  {tactic.name}
                </h3>
                <div className="space-y-4">
                  {leads.map((lead) => {
                    const completed = currentWeekLogs.filter((log) => 
                      log.indicators?.some((li) => li.indicatorId === lead.id && li.isCompleted)
                    ).length;
                    const target = lead.targetCount || 7;
                    const percentage = Math.min(Math.round((completed / target) * 100), 100);

                    return (
                      <div key={lead.id} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-zinc-300">{lead.name}</span>
                          <span className="text-emerald-400 font-semibold">{completed}/{target} times</span>
                        </div>
                        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
