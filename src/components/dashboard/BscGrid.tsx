import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Cpu, Dumbbell, Rocket } from "lucide-react";

interface BscGridProps {
  tactics: any[];
  logs: any[];
}

export function BscGrid({ tactics, logs }: BscGridProps) {
  const totalDays = logs.length || 1;

  const getCategoryStats = (category: string) => {
    const categoryTactics = tactics.filter(t => t.category === category);
    if (categoryTactics.length === 0) return { maxPoints: 0, earnedPoints: 0, percentage: 0 };

    let maxPoints = 0;
    let earnedPoints = 0;

    categoryTactics.forEach(t => {
      const completedCount = logs.filter(log => 
        log.tactics?.some((lt: any) => lt.tacticId === t.id && lt.isCompleted)
      ).length;
      maxPoints += t.weight * totalDays;
      earnedPoints += t.weight * completedCount;
    });

    const percentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    return { maxPoints, earnedPoints, percentage };
  };

  const learning = getCategoryStats("learning");
  const internal = getCategoryStats("internal");
  const health = getCategoryStats("health");
  const value = getCategoryStats("value");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Learning */}
      <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Learning (AI Architect)
          </CardTitle>
          <BrainCircuit className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{learning.percentage}%</div>
          <p className="text-xs text-muted-foreground mt-1">Study progress</p>
          <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${learning.percentage}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Internal Process */}
      <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Internal Process (Deep Work)
          </CardTitle>
          <Cpu className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{internal.percentage}%</div>
          <p className="text-xs text-muted-foreground mt-1">Process compliance</p>
          <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${internal.percentage}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Health */}
      <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Health (The Engine)
          </CardTitle>
          <Dumbbell className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{health.percentage}%</div>
          <p className="text-xs text-muted-foreground mt-1">Physical & Mental routines</p>
          <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${health.percentage}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Value */}
      <Card className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Value (Output)
          </CardTitle>
          <Rocket className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value.percentage}%</div>
          <p className="text-xs text-muted-foreground mt-1">Output value generation</p>
          <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${value.percentage}%` }} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
