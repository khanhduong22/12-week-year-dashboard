"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Save, Target, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/lib/useAuthFetch";
import { useSession } from "next-auth/react";

type Tactic = { id: number; name: string; category: string; weight: number; indicatorType: string; cycleId: number };
type DailyLog = {
  id: number;
  date: string;
  sleepHours: number;
  energyLevel: number;
  strategicBlockStatus: string;
  bufferBlockStatus: string;
  breakoutBlockStatus: string;
  tactics: { tacticId: number; isCompleted: boolean }[];
};
type CycleData = { id: number; startDate: string; endDate: string; tactics: Tactic[] };

export default function WidgetPage() {
  const { data: session, status } = useSession();
  const authFetch = useAuthFetch();
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [tacticsList, setTacticsList] = useState<Tactic[]>([]);
  const [tacticsState, setTacticsState] = useState<Record<number, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);

  // Time calculations
  const [currentWeek, setCurrentWeek] = useState(1);
  const [currentDayOfWeek, setCurrentDayOfWeek] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      if (status !== "authenticated" || !session) return;
      try {
        const [cycleRes, logsRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles/active`),
          authFetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`)
        ]);

        let fetchedTactics: Tactic[] = [];
        if (cycleRes.ok) {
          const cycle: CycleData = await cycleRes.json();
          if (cycle) {
            setCycleData(cycle);
            
            // Calculate current week and day
            const start = new Date(cycle.startDate);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - start.getTime());
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            const week = Math.min(Math.floor(diffDays / 7) + 1, 12);
            const dayOfWeek = (diffDays % 7) + 1;
            
            setCurrentWeek(week);
            setCurrentDayOfWeek(dayOfWeek);

            // Filter out LAG indicators
            fetchedTactics = (cycle.tactics || []).filter((t) => t.indicatorType !== "LAG").sort((a, b) => b.weight - a.weight);
            setTacticsList(fetchedTactics);
            
            const initialState: Record<number, boolean> = {};
            fetchedTactics.forEach((t) => { initialState[t.id] = false; });
            setTacticsState(initialState);
          }
        }
        
        if (logsRes.ok) {
          const logs = await logsRes.json();
          const today = new Date();
          const tLog = logs.find((l: DailyLog) => {
            const d = new Date(l.date);
            return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
          });
          
          if (tLog) {
            setTodayLog(tLog);
            const newState: Record<number, boolean> = {};
            fetchedTactics.forEach((t: Tactic) => { newState[t.id] = false; });
            tLog.tactics.forEach((lt: { tacticId: number; isCompleted: boolean }) => { newState[lt.tacticId] = lt.isCompleted; });
            setTacticsState(newState);
          }
        }
      } catch (e) {
        console.error("Fetch data error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [authFetch, session, status]);

  const handleSave = async () => {
    if (!cycleData) return;
    setIsSaving(true);
    try {
      const payload = {
        sleepHours: todayLog ? todayLog.sleepHours : 7,
        energyLevel: todayLog ? todayLog.energyLevel : 5,
        strategicBlockStatus: todayLog ? todayLog.strategicBlockStatus : "failed",
        bufferBlockStatus: todayLog ? todayLog.bufferBlockStatus : "failed",
        breakoutBlockStatus: todayLog ? todayLog.breakoutBlockStatus : "failed",
        cycleId: cycleData.id,
        date: new Date().toISOString(),
        tactics: {
          create: Object.entries(tacticsState).map(([tId, isDone]) => ({
            tacticId: parseInt(tId),
            isCompleted: isDone
          }))
        }
      };
      
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Server returned status: ${res.status}`);
      }
      
      // Flash green to indicate save
      const bg = document.body.style.backgroundColor;
      document.body.style.backgroundColor = "rgba(16, 185, 129, 0.2)";
      setTimeout(() => { document.body.style.backgroundColor = bg; }, 300);
      
    } catch (e) {
      console.error(e);
      alert("Failed to save log.");
    } finally {
      setIsSaving(false);
    }
  };

  const isAllTacticsDone = tacticsList.length > 0 && Object.values(tacticsState).every(Boolean);

  if (isLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  if (!cycleData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <Target className="w-12 h-12 text-zinc-700 mb-4" />
        <h3 className="text-xl font-bold text-zinc-300">No Active Plan</h3>
        <p className="text-zinc-500 mt-2">Activate a plan from the main dashboard first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans max-w-md mx-auto relative flex flex-col">
      {/* Top Header / Progress */}
      <div className="mb-6 space-y-4">
        <h1 className="text-xl font-bold text-center tracking-tight text-zinc-100 mb-6">Today&apos;s Focus</h1>
        
        {/* Week Progress */}
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Cycle Timeline</span>
            <span className="text-sm font-bold text-orange-400">Week {currentWeek} / 12</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-orange-500 h-full rounded-full" style={{ width: `${(currentWeek / 12) * 100}%` }} />
          </div>
        </div>

        {/* Day Progress */}
        <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Weekly Sprint</span>
            <span className="text-sm font-bold text-blue-400">Day {currentDayOfWeek} / 7</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(currentDayOfWeek / 7) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Execution List */}
      <div className="flex-1 bg-zinc-900/40 border border-white/5 rounded-3xl p-2 pb-24 overflow-y-auto">
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/5 mb-2">
          <span className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Lead Tactics</span>
          {isAllTacticsDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
        </div>
        
        <div className="space-y-1">
          {tacticsList.map(tactic => (
            <label key={tactic.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer group">
              <Checkbox 
                checked={tacticsState[tactic.id] || false} 
                onCheckedChange={(checked) => setTacticsState(p => ({...p, [tactic.id]: checked as boolean}))} 
                className="w-5 h-5 rounded-md mt-0.5 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" 
              />
              <span className={cn("text-[15px] font-medium transition-colors leading-tight", tacticsState[tactic.id] ? "text-zinc-500 line-through" : "text-zinc-200")}>
                {tactic.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl font-bold transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? "Saving..." : "Save Today's Progress"}
          </button>
        </div>
      </div>
    </div>
  );
}
