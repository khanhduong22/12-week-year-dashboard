import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Cpu, Dumbbell, Rocket } from "lucide-react";

export function BscGrid() {
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
          <div className="text-2xl font-bold">75%</div>
          <p className="text-xs text-muted-foreground mt-1">Study guide progress</p>
          <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-[75%] rounded-full" />
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
          <div className="text-2xl font-bold">4.5 hrs</div>
          <p className="text-xs text-muted-foreground mt-1">Daily hours on Linkpul</p>
          <div className="w-full bg-secondary h-2 mt-3 rounded-full overflow-hidden">
            <div className="bg-purple-500 h-full w-[60%] rounded-full" />
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
          <div className="text-2xl font-bold flex items-baseline gap-2">
            76.4 <span className="text-sm font-normal text-muted-foreground">kg</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Muscle Mass: 56.3kg</p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-green-400">Visceral Fat: 9 → 8</span>
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
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground mt-1">Features shipped</p>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-2 flex-1 rounded-sm bg-orange-500" />
            ))}
            <div className="h-2 flex-1 rounded-sm bg-secondary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
