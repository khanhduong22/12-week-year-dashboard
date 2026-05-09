"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Moon, Zap, Target, Mail, Coffee, CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthFetch } from "@/lib/useAuthFetch";

type BlockStatus = "failed" | "partial" | "nailed";
type Indicator = {
  id: number;
  name: string;
  type: string;
  targetCount?: number;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
};

type Tactic = { 
  id: number; 
  name: string; 
  category: string; 
  weight: number; 
  cycleId: number;
  indicators: Indicator[];
};

type DailyLog = {
  id: number;
  date: string;
  sleepHours: number;
  energyLevel: number;
  strategicBlockStatus: BlockStatus;
  bufferBlockStatus: BlockStatus;
  breakoutBlockStatus: BlockStatus;
  indicators: { indicatorId: number; isCompleted: boolean }[];
};

export default function HistoryPage() {
  const authFetch = useAuthFetch();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [tacticsList, setTacticsList] = useState<Tactic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  type Cycle = { startDate: string; endDate?: string; tactics?: Tactic[] };
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cycleRes, logsRes] = await Promise.all([
          authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles/active`),
          authFetch(`${process.env.NEXT_PUBLIC_API_URL}/logs`)
        ]);
        
        if (cycleRes.ok) {
          const cycle = await cycleRes.json();
          setActiveCycle(cycle);
          if (cycle?.tactics) {
            setTacticsList(cycle.tactics.sort((a: Tactic, b: Tactic) => b.weight - a.weight));
          }
        }
        if (logsRes.ok) {
          setLogs(await logsRes.json());
        }
      } catch (e) {
        console.error("Fetch data error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getLogForDate = (date: Date) => {
    return logs.find(log => {
      const logDate = new Date(log.date);
      return isSameDay(logDate, date);
    });
  };

  const currentLog = getLogForDate(selectedDate);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const emptyDays = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    for (let i = 0; i < emptyDays; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
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

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Helper to determine cycle dates
  const cycleStartDate = activeCycle?.startDate ? new Date(activeCycle.startDate) : null;
  const cycleEndDate = activeCycle?.endDate ? new Date(activeCycle.endDate) : null;
  
  const getCycleMarker = (date: Date): { type: 'start' | 'end' | 'week', label: string, weekNum?: number } | null => {
    if (!cycleStartDate) return null;
    
    // Normalize times for accurate day comparison
    const normDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const normStart = new Date(cycleStartDate.getFullYear(), cycleStartDate.getMonth(), cycleStartDate.getDate()).getTime();
    
    let normEnd = -1;
    if (cycleEndDate) {
      normEnd = new Date(cycleEndDate.getFullYear(), cycleEndDate.getMonth(), cycleEndDate.getDate()).getTime();
    } else {
      // If no end date, calculate 12 weeks (84 days - 1) from start
      normEnd = normStart + (83 * 24 * 60 * 60 * 1000);
    }

    if (normDate === normStart) return { type: 'start', label: 'START' };
    if (normDate === normEnd) return { type: 'end', label: 'END' };
    
    // Check if it's the start of a new week within the cycle
    if (normDate > normStart && normDate <= normEnd) {
      const diffDays = Math.floor((normDate - normStart) / (1000 * 60 * 60 * 24));
      if (diffDays % 7 === 0) {
        const weekNum = (diffDays / 7) + 1;
        return { type: 'week', label: `W${weekNum}`, weekNum };
      }
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans selection:bg-zinc-800">
      <main className="max-w-5xl mx-auto px-4 pt-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-zinc-800/50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Execution History</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Calendar */}
          <div className="md:col-span-7">
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                  <ChevronLeft className="w-5 h-5 text-zinc-400" />
                </button>
                <h2 className="text-xl font-bold text-white">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={() => changeMonth(1)} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                  <ChevronRight className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-xs font-bold text-zinc-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }
                  
                  const isSelected = isSameDay(selectedDate, date);
                  const isToday = isSameDay(new Date(), date);
                  const hasLog = !!getLogForDate(date);
                  const marker = getCycleMarker(date);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={cn(
                        "aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all border",
                        isSelected 
                          ? "bg-emerald-500 text-zinc-950 scale-105 shadow-lg shadow-emerald-500/20 border-emerald-500" 
                          : isToday 
                            ? "bg-zinc-800 border-emerald-500/50 text-emerald-400 hover:bg-zinc-800" 
                            : "bg-zinc-900/50 border-white/5 hover:bg-zinc-800 text-zinc-300"
                      )}
                    >
                      {/* Optional Marker for Start/End/Week */}
                      {marker && (
                        <div className={cn(
                          "absolute top-1 text-[8px] font-bold px-1 rounded-sm uppercase tracking-tighter text-white",
                          marker.type === 'start' ? "bg-indigo-500" :
                          marker.type === 'end' ? "bg-red-500" :
                          marker.weekNum && marker.weekNum <= 4 ? "bg-indigo-500" :
                          marker.weekNum && marker.weekNum <= 8 ? "bg-yellow-500" :
                          "bg-red-500"
                        )}>
                          {marker.label}
                        </div>
                      )}
                      
                      <span className={cn("text-sm font-bold z-10", isSelected ? "text-zinc-900" : "")}>
                        {date.getDate()}
                      </span>
                      {hasLog && (
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full absolute bottom-2",
                          isSelected ? "bg-zinc-900" : "bg-emerald-500"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Daily Details */}
          <div className="md:col-span-5">
            <h3 className="text-xl font-bold text-white mb-6">
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>

            {isLoading ? (
              <div className="flex justify-center p-12">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !currentLog ? (
              <div className="bg-zinc-900/40 border border-dashed border-zinc-800 rounded-3xl p-10 text-center">
                <Target className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">No execution log found for this date.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bio-Metrics */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Bio-Metrics</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Moon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="font-medium text-sm">Sleep</span>
                    </div>
                    <span className="text-lg font-bold text-indigo-400">{currentLog.sleepHours}<span className="text-xs text-zinc-500 ml-1">hrs</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-500/10 rounded-xl">
                        <Zap className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="font-medium text-sm">Energy</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-400">{currentLog.energyLevel}<span className="text-xs text-zinc-500 ml-1">/10</span></span>
                  </div>
                </div>

                {/* Time Blocks */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Time Blocks</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className={cn("p-3 rounded-2xl border flex flex-col items-center text-center", getStatusColor(currentLog.strategicBlockStatus))}>
                      <Target className="w-5 h-5 mb-2 opacity-80" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{getStatusText(currentLog.strategicBlockStatus)}</span>
                    </div>
                    <div className={cn("p-3 rounded-2xl border flex flex-col items-center text-center", getStatusColor(currentLog.bufferBlockStatus))}>
                      <Mail className="w-5 h-5 mb-2 opacity-80" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{getStatusText(currentLog.bufferBlockStatus)}</span>
                    </div>
                    <div className={cn("p-3 rounded-2xl border flex flex-col items-center text-center", getStatusColor(currentLog.breakoutBlockStatus))}>
                      <Coffee className="w-5 h-5 mb-2 opacity-80" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">{getStatusText(currentLog.breakoutBlockStatus)}</span>
                    </div>
                  </div>
                </div>

                {/* Tactics and Indicators */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Indicators</h4>
                  {tacticsList.map(tactic => {
                    const leadInds = (tactic.indicators || []).filter(i => i.type === "LEAD");
                    if (leadInds.length === 0) return null;

                    return (
                      <div key={tactic.id} className="mb-4 last:mb-0">
                        <div className="text-sm font-semibold text-zinc-400 mb-2">{tactic.name}</div>
                        <div className="space-y-2">
                          {leadInds.map(ind => {
                            const logInd = currentLog.indicators?.find(li => li.indicatorId === ind.id);
                            const isCompleted = logInd?.isCompleted || false;
                            
                            return (
                              <div key={ind.id} className="flex items-center gap-3 pl-2 group">
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-600 shrink-0" />
                                )}
                                <span className={cn("text-sm transition-colors", isCompleted ? "text-zinc-500 line-through" : "text-zinc-200")}>
                                  {ind.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  {tacticsList.length === 0 && (
                    <div className="text-center text-zinc-500 text-sm">No tactics configured.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
