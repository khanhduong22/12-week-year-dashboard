import { Progress } from "@/components/ui/progress";

interface CountdownHeaderProps {
  currentWeek: number;
  totalWeeks: number;
  currentDay?: number;
}

export function CountdownHeader({ currentWeek, totalWeeks, currentDay }: CountdownHeaderProps) {
  const progressPercent = (currentWeek / totalWeeks) * 100;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold tracking-tight">The 12-Week Countdown</h2>
        <div className="text-right">
          <span className="block text-sm text-muted-foreground font-medium">
            Week {currentWeek} of {totalWeeks}
          </span>
          {currentDay && (
            <span className="block text-xs text-indigo-400 font-semibold mt-0.5">
              Day {currentDay} of 7
            </span>
          )}
        </div>
      </div>
      <Progress value={progressPercent} className="h-3" />
      <p className="mt-2 text-xs text-muted-foreground text-right">
        {Math.round(progressPercent)}% completed
      </p>
    </div>
  );
}
