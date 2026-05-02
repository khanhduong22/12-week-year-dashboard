import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Heart, Briefcase, Coins, Users, BookOpen, Gamepad2, Home, Globe, Sparkles } from "lucide-react";
import type { DailyLog } from "@/app/page";

interface BscGridProps {
  tactics: { id: number; name: string; category: string; weight: number }[];
  logs: DailyLog[];
}

export function BscGrid({ tactics, logs }: BscGridProps) {
  const totalDays = logs.length || 1;

  // Extract unique active categories
  const activeCategories = Array.from(new Set(tactics.map(t => t.category)));

  const getCategoryStats = (category: string) => {
    const categoryTactics = tactics.filter(t => t.category === category);
    if (categoryTactics.length === 0) return { maxPoints: 0, earnedPoints: 0, percentage: 0 };

    let maxPoints = 0;
    let earnedPoints = 0;

    categoryTactics.forEach(t => {
      const completedCount = logs.filter(log => 
        log.tactics?.some((lt) => lt.tacticId === t.id && lt.isCompleted)
      ).length;
      maxPoints += t.weight * totalDays;
      earnedPoints += t.weight * completedCount;
    });

    const percentage = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;
    return { maxPoints, earnedPoints, percentage };
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Health & Fitness": return "text-red-400";
      case "Career & Business": return "text-blue-400";
      case "Finances": return "text-emerald-400";
      case "Relationships & Family": return "text-pink-400";
      case "Personal Growth": return "text-purple-400";
      case "Recreation & Fun": return "text-orange-400";
      case "Physical Environment": return "text-teal-400";
      case "Community & Contribution": return "text-yellow-400";
      case "Spiritual & Faith": return "text-indigo-400";
      default: return "text-zinc-400";
    }
  };

  const getCategoryBg = (cat: string) => {
    switch (cat) {
      case "Health & Fitness": return "bg-red-500";
      case "Career & Business": return "bg-blue-500";
      case "Finances": return "bg-emerald-500";
      case "Relationships & Family": return "bg-pink-500";
      case "Personal Growth": return "bg-purple-500";
      case "Recreation & Fun": return "bg-orange-500";
      case "Physical Environment": return "bg-teal-500";
      case "Community & Contribution": return "bg-yellow-500";
      case "Spiritual & Faith": return "bg-indigo-500";
      default: return "bg-zinc-500";
    }
  };

  const getCategoryIcon = (cat: string) => {
    const className = `h-4 w-4 ${getCategoryColor(cat)}`;
    switch (cat) {
      case "Health & Fitness": return <Heart className={className} />;
      case "Career & Business": return <Briefcase className={className} />;
      case "Finances": return <Coins className={className} />;
      case "Relationships & Family": return <Users className={className} />;
      case "Personal Growth": return <BookOpen className={className} />;
      case "Recreation & Fun": return <Gamepad2 className={className} />;
      case "Physical Environment": return <Home className={className} />;
      case "Community & Contribution": return <Globe className={className} />;
      case "Spiritual & Faith": return <Sparkles className={className} />;
      default: return <Target className={className} />;
    }
  };

  if (activeCategories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {activeCategories.map(cat => {
        const stats = getCategoryStats(cat);
        return (
          <Card key={cat} className="bg-background/50 backdrop-blur-sm border-white/10 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {cat}
              </CardTitle>
              {getCategoryIcon(cat)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.percentage}%</div>
              <p className="text-xs text-muted-foreground mt-1">Execution Score</p>
              <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
                <div 
                  className={`${getCategoryBg(cat)} h-full rounded-full transition-all duration-500`} 
                  style={{ width: `${stats.percentage}%` }} 
                />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
