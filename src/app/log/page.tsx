"use client";

import { useState, useEffect } from "react";
import { Flame, Moon, Zap, Target, Mail, CheckCircle2, Save, ChevronLeft, Coffee, Info } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/lib/useAuthFetch";

// Types
type BlockStatus = "failed" | "partial" | "nailed";

export default function DailyLogPage() {
  const authFetch = useAuthFetch();
  const [sleep, setSleep] = useState([7]);
  const [energy, setEnergy] = useState([8]);
  const [weight, setWeight] = useState<string>("");
  const [bodyFat, setBodyFat] = useState<string>("");
  const [strategicBlock, setStrategicBlock] = useState<BlockStatus>("failed");
  const [bufferBlock, setBufferBlock] = useState<BlockStatus>("failed");
  const [breakoutBlock, setBreakoutBlock] = useState<BlockStatus>("failed");
  
  // Real data state
  type Indicator = { id: number; name: string; type: string; targetValue?: number; unit?: string };
  type Tactic = { id: number; name: string; category: string; weight: number; cycleId: number; indicators: Indicator[] };
  type DailyLog = {
    id: number;
    date: string;
    sleepHours: number;
    energyLevel: number;
    weight?: number;
    bodyFat?: number;
    strategicBlockStatus: BlockStatus;
    bufferBlockStatus: BlockStatus;
    breakoutBlockStatus: BlockStatus;
    indicators: { indicatorId: number; isCompleted: boolean }[];
  };

  type CycleData = { id: number; strategicBlockDesc?: string; bufferBlockDesc?: string; breakoutBlockDesc?: string; tactics: Tactic[] };
  
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [tacticsList, setTacticsList] = useState<Tactic[]>([]);
  const [indicatorsState, setIndicatorsState] = useState<Record<number, boolean>>({});
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);
  const [selectedLogDate, setSelectedLogDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setSleep([7]);
    setEnergy([8]);
    setWeight("");
    setBodyFat("");
    setStrategicBlock("failed");
    setBufferBlock("failed");
    setBreakoutBlock("failed");
    const initialState: Record<number, boolean> = {};
    tacticsList.forEach((t: Tactic) => {
      t.indicators?.forEach((ind) => {
        if (ind.type === "LEAD") initialState[ind.id] = false;
      });
    });
    setIndicatorsState(initialState);
  };

  const populateForm = (log: DailyLog) => {
    setSleep([log.sleepHours || 7]);
    setEnergy([log.energyLevel || 5]);
    setWeight(log.weight ? log.weight.toString() : "");
    setBodyFat(log.bodyFat ? log.bodyFat.toString() : "");
    setStrategicBlock(log.strategicBlockStatus || "failed");
    setBufferBlock(log.bufferBlockStatus || "failed");
    setBreakoutBlock(log.breakoutBlockStatus || "failed");
    
    const newState: Record<number, boolean> = {};
    tacticsList.forEach((t: Tactic) => {
      t.indicators?.forEach((ind) => {
        if (ind.type === "LEAD") newState[ind.id] = false;
      });
    });
    if (log.indicators) {
      log.indicators.forEach((li: { indicatorId: number; isCompleted: boolean }) => { newState[li.indicatorId] = li.isCompleted; });
    }
    setIndicatorsState(newState);
  };

  const changeDate = (offset: number) => {
    const newDate = new Date(selectedLogDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedLogDate(newDate);
  };

  useEffect(() => {
    const fetchData = async () => {
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
            // No need to filter LAG indicators at the Tactic level now, they are nested.
            fetchedTactics = (cycle.tactics || []).sort((a, b) => b.weight - a.weight);
            setTacticsList(fetchedTactics);
            
            const initialState: Record<number, boolean> = {};
            fetchedTactics.forEach((t: Tactic) => {
              t.indicators?.forEach((ind) => {
                if (ind.type === "LEAD") initialState[ind.id] = false;
              });
            });
            setIndicatorsState(initialState);
          }
        }
        
        if (logsRes.ok) {
          const logs = await logsRes.json();
          setAllLogs(logs);
          
          // Populate current day if exists
          const todayLog = logs.find((l: DailyLog) => {
            const d = new Date(l.date);
            const today = new Date();
            return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
          });
          if (todayLog) {
            setSleep([todayLog.sleepHours]);
            setEnergy([todayLog.energyLevel]);
            setWeight(todayLog.weight ? todayLog.weight.toString() : "");
            setBodyFat(todayLog.bodyFat ? todayLog.bodyFat.toString() : "");
            setStrategicBlock(todayLog.strategicBlockStatus);
            setBufferBlock(todayLog.bufferBlockStatus);
            setBreakoutBlock(todayLog.breakoutBlockStatus);
            const newState: Record<number, boolean> = {};
            fetchedTactics.forEach((t: Tactic) => {
              t.indicators?.forEach((ind) => {
                if (ind.type === "LEAD") newState[ind.id] = false;
              });
            });
            todayLog.indicators?.forEach((li: { indicatorId: number; isCompleted: boolean }) => { newState[li.indicatorId] = li.isCompleted; });
            setIndicatorsState(newState);
          }
        }
      } catch (e) {
        console.error("Fetch data error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (allLogs.length > 0 || tacticsList.length > 0) {
      const logForDate = allLogs.find((l: DailyLog) => {
        const d = new Date(l.date);
        return d.getFullYear() === selectedLogDate.getFullYear() && 
               d.getMonth() === selectedLogDate.getMonth() && 
               d.getDate() === selectedLogDate.getDate();
      });
      if (logForDate) {
        populateForm(logForDate);
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLogDate, allLogs]);

  const isAllTacticsDone = Object.keys(indicatorsState).length > 0 && Object.values(indicatorsState).every(Boolean);

  const cycleStatus = (current: BlockStatus): BlockStatus => {
    if (current === "failed") return "partial";
    if (current === "partial") return "nailed";
    return "failed";
  };

  const getStatusColor = (status: BlockStatus) => {
    if (status === "nailed") return "bg-green-500/20 text-green-400 border-green-500/30";
    if (status === "partial") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-zinc-800/50 text-zinc-500 border-white/5";
  };

  const getStatusText = (status: BlockStatus) => {
    if (status === "nailed") return "Nailed It!";
    if (status === "partial") return "Partial";
    return "Failed / Skipped";
  };

  // Helper for Energy Gradient
  const energyColors = [
    "text-red-500", "text-orange-500", "text-yellow-500", 
    "text-lime-500", "text-green-500", "text-emerald-400"
  ];
  const energyColor = energyColors[Math.floor((energy[0] - 1) / 2)] || "text-emerald-400";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans selection:bg-zinc-800">
      <main className="max-w-2xl mx-auto px-4 pt-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-zinc-800/50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </Link>
          <div className="flex items-center gap-2 bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full border border-orange-500/20">
            <Flame className="w-4 h-4 fill-orange-400" />
            <span className="text-sm font-semibold tracking-wide">12 Day Streak</span>
          </div>
        </div>

        <div className="mb-10 flex flex-col items-center">
          <h1 className="text-3xl font-bold tracking-tight mb-4">Daily Execution Log</h1>
          
          <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-2xl border border-white/5">
            <button onClick={() => changeDate(-1)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <div className="flex flex-col items-center min-w-[140px]">
              <span className="font-bold text-white text-lg">
                {selectedLogDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {selectedLogDate.toLocaleDateString('en-US', { weekday: 'long' })}
              </span>
            </div>
            <button 
              onClick={() => changeDate(1)} 
              disabled={selectedLogDate.setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400 rotate-180" />
            </button>
          </div>
        </div>

        {!isLoading && !cycleData ? (
          <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800">
            <Target className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-300 mb-2">No Active Cycle</h3>
            <p className="text-zinc-500 mb-6">You don&apos;t have an active 12-Week plan running right now. Please activate a plan first.</p>
            <Link href="/config" className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-full font-bold hover:bg-emerald-400 transition-colors inline-block">
              Go to Plan Management
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 1: The Engine (Bio-Metrics) */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider ml-1">The Engine</h2>
            
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 space-y-8">
              {/* Sleep Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                      <Moon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <span className="font-medium">Sleep Duration</span>
                  </div>
                  <span className="text-lg font-bold text-indigo-400">{sleep[0]}<span className="text-sm font-medium text-zinc-500 ml-1">hrs</span></span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={sleep[0]}
                  onChange={(e) => setSleep([parseFloat(e.target.value)])}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Energy Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/10 rounded-xl">
                      <Zap className={`w-5 h-5 ${energyColor} fill-current`} />
                    </div>
                    <span className="font-medium">Energy Level</span>
                  </div>
                  <span className={`text-lg font-bold ${energyColor}`}>{energy[0]}<span className="text-sm font-medium text-zinc-500 ml-1">/10</span></span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={energy[0]}
                  onChange={(e) => setEnergy([parseInt(e.target.value, 10)])}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              {/* Bio-Metrics (Weight & Body Fat) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 70.5"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                    placeholder="e.g. 15.2"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Time Blocks */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-2">
              Time Blocks
              <div className="group relative flex items-center">
                <Info className="w-4 h-4 text-zinc-400 hover:text-white cursor-help transition-colors" />
                <div className="absolute left-0 bottom-full mb-2 w-[340px] md:w-[400px] p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs text-zinc-300 normal-case tracking-normal">
                  <p className="font-bold text-white mb-2 text-sm">Quy tắc Time Blocks (12WY):</p>
                  <ul className="space-y-3 list-none">
                    <li><strong className="text-indigo-400 flex items-center gap-1"><Target className="w-3 h-3"/> Strategic (1 lần/tuần - 3 tiếng):</strong> Deep work không gián đoạn để làm task quan trọng nhất giúp thay đổi cuộc chơi.</li>
                    <li><strong className="text-blue-400 flex items-center gap-1"><Mail className="w-3 h-3"/> Buffer (1-2 lần/ngày - 30-60p):</strong> Gom các việc lắt nhắt (check email, admin) lại làm một lần để tránh bị phân tâm trong ngày.</li>
                    <li><strong className="text-orange-400 flex items-center gap-1"><Coffee className="w-3 h-3"/> Breakout (1 lần/tuần - 3 tiếng):</strong> Hoàn toàn nghỉ ngơi, giải trí để tránh burnout.</li>
                  </ul>
                  <p className="mt-3 pt-2 border-t border-zinc-700/50 text-zinc-400 italic">Lưu ý: Không bắt buộc phải làm cả 3 mỗi ngày. Hãy đánh dấu nếu hôm nay bạn có thực hiện, để trống (hoặc failed) nếu không.</p>
                </div>
              </div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Strategic Block */}
              <button 
                onClick={() => setStrategicBlock(cycleStatus(strategicBlock))}
                className={cn(
                  "p-5 rounded-3xl border text-left transition-all duration-300 active:scale-[0.98]",
                  getStatusColor(strategicBlock)
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-black/20 rounded-full">
                    {getStatusText(strategicBlock)}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-zinc-100 mb-1">Strategic Block</h3>
                <p className="text-sm opacity-80">{cycleData?.strategicBlockDesc || "3h Uninterrupted Deep Work"}</p>
              </button>

              {/* Buffer Block */}
              <button 
                onClick={() => setBufferBlock(cycleStatus(bufferBlock))}
                className={cn(
                  "p-5 rounded-3xl border text-left transition-all duration-300 active:scale-[0.98]",
                  getStatusColor(bufferBlock)
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <Mail className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-black/20 rounded-full">
                    {getStatusText(bufferBlock)}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-zinc-100 mb-1">Buffer Block</h3>
                <p className="text-sm opacity-80">{cycleData?.bufferBlockDesc || "1h Emails & Routing"}</p>
              </button>

              {/* Breakout Block */}
              <button 
                onClick={() => setBreakoutBlock(cycleStatus(breakoutBlock))}
                className={cn(
                  "p-5 rounded-3xl border text-left transition-all duration-300 active:scale-[0.98]",
                  getStatusColor(breakoutBlock)
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-black/20 rounded-xl">
                    <Coffee className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 bg-black/20 rounded-full">
                    {getStatusText(breakoutBlock)}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-zinc-100 mb-1">Breakout Block</h3>
                <p className="text-sm opacity-80">{cycleData?.breakoutBlockDesc || "3h Free Time to Recharge"}</p>
              </button>
            </div>
          </section>

          {/* Section 3: Tactics Execution */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider ml-1 flex items-center justify-between">
              <span>Tactics Execution</span>
              {isAllTacticsDone && (
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All Done!
                </span>
              )}
            </h2>
            
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-4 space-y-6">
              {tacticsList.map(tactic => {
                const leads = (tactic.indicators || []).filter(i => i.type === "LEAD");
                if (leads.length === 0) return null;
                
                const allLeadsCompleted = leads.every(l => indicatorsState[l.id]);

                return (
                  <div key={tactic.id} className="space-y-2">
                    <h3 className={cn("text-xs font-bold uppercase tracking-wider mb-2", allLeadsCompleted ? "text-emerald-500" : "text-zinc-400")}>
                      {tactic.name}
                    </h3>
                    <div className="space-y-1">
                      {leads.map(lead => (
                        <label key={lead.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                          <Checkbox 
                            checked={indicatorsState[lead.id] || false} 
                            onCheckedChange={(checked) => setIndicatorsState(p => ({...p, [lead.id]: checked as boolean}))} 
                            className="w-6 h-6 rounded-full data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" 
                          />
                          <span className={cn("text-base font-medium transition-colors flex-1", indicatorsState[lead.id] ? "text-zinc-500 line-through" : "text-zinc-200 group-hover:text-white")}>
                            {lead.name}
                            {lead.targetValue && <span className="block text-xs text-orange-400/80 mt-0.5 no-underline">🎯 Mục tiêu: {lead.targetValue} {lead.unit}</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              {tacticsList.length === 0 && !isLoading && (
                <div className="p-4 text-zinc-500 text-center">No tactics configured yet. Go to Config page to add some!</div>
              )}
            </div>
          </section>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {!isLoading && cycleData && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none">
          <div className="max-w-2xl mx-auto flex justify-end pointer-events-auto">
            <button 
              onClick={async () => {
                setIsSaving(true);
                try {
                  const payload = {
                    sleepHours: sleep[0],
                    energyLevel: energy[0],
                    weight: weight ? parseFloat(weight) : null,
                    bodyFat: bodyFat ? parseFloat(bodyFat) : null,
                    strategicBlockStatus: strategicBlock,
                    bufferBlockStatus: bufferBlock,
                    breakoutBlockStatus: breakoutBlock,
                    cycleId: cycleData?.id || 1,
                    date: selectedLogDate.toISOString(),
                    indicators: {
                      create: Object.entries(indicatorsState).map(([indId, isDone]) => ({
                        indicatorId: parseInt(indId),
                        isCompleted: isDone
                      }))
                    }
                  };
                  await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                  });
                  
                  // Update local state without reloading
                  const newLogsRes = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`);
                  if (newLogsRes.ok) setAllLogs(await newLogsRes.json());
                  
                  alert("Daily log saved successfully!");
                } catch (e) {
                  console.error(e);
                  alert("Failed to save log.");
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-6 py-4 rounded-full font-bold shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all active:scale-95 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {isSaving ? "Saving..." : "Save Daily Log"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
