import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export type ChecklistState = {
  sleep: boolean;
  snack: boolean;
  study: boolean;
  exercise: boolean;
};

interface ScorecardChecklistProps {
  checklist: ChecklistState;
  onToggle: (key: keyof ChecklistState) => void;
}

export function ScorecardChecklist({ checklist, onToggle }: ScorecardChecklistProps) {
  const items = [
    { key: "sleep" as const, label: "Slept before 9:00 PM." },
    { key: "snack" as const, label: "Ate pre-workout snack (Banana/Whey) before Badminton." },
    { key: "study" as const, label: "2 Hours of Claude Study Guide." },
    { key: "exercise" as const, label: "5 Compound Exercises Completed (Bench, Squat, Deadlift, OHP, Row)." },
  ];

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          Weekly Scorecard Checklist
          <span className="text-xs font-normal text-muted-foreground ml-auto bg-secondary px-2 py-1 rounded-md">
            Lead Indicators
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="flex items-start space-x-3">
            <Checkbox
              id={item.key}
              checked={checklist[item.key]}
              onCheckedChange={() => onToggle(item.key)}
              className="mt-1"
            />
            <label
              htmlFor={item.key}
              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer ${
                checklist[item.key] ? "text-muted-foreground line-through" : "text-foreground"
              }`}
            >
              {item.label}
            </label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
