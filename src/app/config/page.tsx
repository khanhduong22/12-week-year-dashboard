"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, Plus, Target, Heart, Briefcase, Coins, Users, BookOpen, Gamepad2, Home, Globe, Sparkles, CheckCircle2, Play, XCircle } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useAuthFetch } from "@/lib/useAuthFetch";

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
type Cycle = { 
  id: number; 
  name: string; 
  startDate: string; 
  endDate: string; 
  isActive: boolean;
  strategicBlockDesc?: string;
  bufferBlockDesc?: string;
  breakoutBlockDesc?: string;
  tactics: Tactic[] 
};

export default function ConfigPage() {
  const authFetch = useAuthFetch();
  const [activeCycle, setActiveCycle] = useState<Cycle | null>(null);
  const [draftCycles, setDraftCycles] = useState<Cycle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"active" | "drafts">("active");
  const [selectedDraft, setSelectedDraft] = useState<Cycle | null>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTacticName, setNewTacticName] = useState("");
  const [newTacticCategory, setNewTacticCategory] = useState("Career & Business");
  const [newTacticWeight, setNewTacticWeight] = useState(3);
  const [newTacticTargetCount, setNewTacticTargetCount] = useState(7);
  const [newTacticIndicatorType, setNewTacticIndicatorType] = useState("LEAD");
  const [newTacticTargetValue, setNewTacticTargetValue] = useState<number>(0);
  const [newTacticUnit, setNewTacticUnit] = useState("");

  const fetchCycles = async () => {
    setIsLoading(true);
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles`);
      if (res.ok) {
        const data: Cycle[] = await res.json();
        // Sort tactics by weight descending for all cycles
        data.forEach(c => {
          c.tactics = c.tactics.sort((a, b) => b.weight - a.weight);
        });
        
        const active = data.find(c => c.isActive) || null;
        setActiveCycle(active);
        
        const drafts = data.filter(c => !c.isActive).sort((a, b) => b.id - a.id); // newest first
        setDraftCycles(drafts);
        
        if (!active && drafts.length > 0) {
          setActiveTab("drafts");
        }
      }
    } catch (e) {
      console.error("API Fetch Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authFetch]);

  const handleSaveActiveTactics = async () => {
    if (!activeCycle) return;
    setIsSaving(true);
    try {
      for (const t of activeCycle.tactics) {
        if (t.id < 0) {
          // New tactic added locally but not saved yet
          await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              name: t.name, 
              category: t.category, 
              weight: t.weight, 
              cycleId: activeCycle.id,
              indicators: {
                create: t.indicators.map(ind => ({
                  name: ind.name,
                  type: ind.type,
                  targetCount: ind.targetCount,
                  targetValue: ind.targetValue,
                  currentValue: ind.currentValue,
                  unit: ind.unit
                }))
              }
            })
          });
        } else {
          // Update tactic weight
          await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics/${t.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: t.weight })
          }).catch(() => {});
          
          // Note: Full UI for editing individual indicator targets is complex.
          // For now, we rely on AI planner to set them up, and only allow adjusting Tactic weight here.
        }
      }
      
      // Update Cycle settings (startDate)
      await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles/${activeCycle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate: activeCycle.startDate })
      });
      
      alert("Configuration saved to database!");
      await fetchCycles();
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleActivateCycle = async (id: number) => {
    if (!confirm("This will close the current active cycle and start this new plan. Continue?")) return;
    try {
      await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles/${id}/activate`, { method: 'POST' });
      await fetchCycles();
      setActiveTab("active");
    } catch (e) {
      console.error(e);
      alert("Failed to activate cycle.");
    }
  };

  const handleCloseActiveCycle = async () => {
    if (!activeCycle) return;
    if (!confirm("Are you sure you want to close the current active cycle? You won't be able to log daily progress until you activate a new one.")) return;
    try {
      await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/cycles/${activeCycle.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false })
      });
      await fetchCycles();
      setActiveTab("drafts");
    } catch (e) {
      console.error(e);
      alert("Failed to close cycle.");
    }
  };

  const handleAddTactic = () => {
    if (!newTacticName.trim() || !activeCycle) return;
    
    const newIndicator: Indicator = {
      id: -Date.now() - 1,
      name: `Default ${newTacticIndicatorType} for ${newTacticName}`,
      type: newTacticIndicatorType,
      targetCount: newTacticIndicatorType === "LEAD" ? newTacticTargetCount : undefined,
      targetValue: newTacticIndicatorType === "LAG" ? newTacticTargetValue : undefined,
      currentValue: newTacticIndicatorType === "LAG" ? 0 : undefined,
      unit: newTacticIndicatorType === "LAG" ? newTacticUnit : undefined,
    };

    const newTactic: Tactic = {
      id: -Date.now(), // temporary negative ID
      name: newTacticName,
      category: newTacticCategory,
      weight: newTacticWeight,
      cycleId: activeCycle.id,
      indicators: [newIndicator]
    };
    
    setActiveCycle({
      ...activeCycle,
      tactics: [...activeCycle.tactics, newTactic]
    });
    
    setShowAddForm(false);
    setNewTacticName("");
    setNewTacticWeight(3);
    setNewTacticTargetCount(7);
    setNewTacticTargetValue(0);
    setNewTacticUnit("");
  };

  const handleDeleteTactic = async (id: number) => {
    if (!activeCycle) return;
    if (id > 0) {
      try {
        await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics/${id}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error("Failed to delete tactic", e);
      }
    }
    setActiveCycle({
      ...activeCycle,
      tactics: activeCycle.tactics.filter(t => t.id !== id)
    });
  };

  const updateWeight = (id: number, val: number) => {
    if (!activeCycle) return;
    setActiveCycle({
      ...activeCycle,
      tactics: activeCycle.tactics.map(t => t.id === id ? { ...t, weight: val } : t)
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Health & Fitness": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Career & Business": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Finances": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Relationships & Family": return "bg-pink-500/10 text-pink-400 border-pink-500/20";
      case "Personal Growth": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "Recreation & Fun": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Physical Environment": return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "Community & Contribution": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Spiritual & Faith": return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Health & Fitness": return <Heart className="w-4 h-4" />;
      case "Career & Business": return <Briefcase className="w-4 h-4" />;
      case "Finances": return <Coins className="w-4 h-4" />;
      case "Relationships & Family": return <Users className="w-4 h-4" />;
      case "Personal Growth": return <BookOpen className="w-4 h-4" />;
      case "Recreation & Fun": return <Gamepad2 className="w-4 h-4" />;
      case "Physical Environment": return <Home className="w-4 h-4" />;
      case "Community & Contribution": return <Globe className="w-4 h-4" />;
      case "Spiritual & Faith": return <Sparkles className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getHexColor = (cat: string) => {
    switch (cat) {
      case "Health & Fitness": return "#ef4444";
      case "Career & Business": return "#3b82f6";
      case "Finances": return "#10b981";
      case "Relationships & Family": return "#ec4899";
      case "Personal Growth": return "#a855f7";
      case "Recreation & Fun": return "#f97316";
      case "Physical Environment": return "#14b8a6";
      case "Community & Contribution": return "#eab308";
      case "Spiritual & Faith": return "#6366f1";
      default: return "#71717a";
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans selection:bg-zinc-800">
      <main className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-zinc-800/50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </Link>
          <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-sm font-medium">
            Plan Management
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cycle Configuration</h1>
          <p className="text-zinc-400 font-medium">Manage your active 12-Week plan and compare draft AI plans.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex space-x-2 mb-8 p-1 bg-zinc-900/50 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${activeTab === "active" ? "bg-emerald-500 text-zinc-950 shadow-md" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"}`}
          >
            Active Plan {activeCycle ? "🔥" : ""}
          </button>
          <button
            onClick={() => setActiveTab("drafts")}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === "drafts" ? "bg-zinc-800 text-white shadow-md border border-zinc-700" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"}`}
          >
            Draft Plans & Comparison
            {draftCycles.length > 0 && (
              <span className="bg-orange-500/20 text-orange-400 py-0.5 px-2 rounded-full text-xs">{draftCycles.length}</span>
            )}
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-emerald-500 animate-pulse font-semibold">
            Loading cycles...
          </div>
        ) : activeTab === "active" ? (
          /* ACTIVE TAB */
          !activeCycle ? (
            <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800">
              <Target className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-zinc-300 mb-2">No Active Cycle</h3>
              <p className="text-zinc-500 mb-6">You don&apos;t have an active 12-Week plan running right now.</p>
              <button 
                onClick={() => setActiveTab("drafts")}
                className="bg-emerald-500 text-zinc-950 px-6 py-3 rounded-full font-bold hover:bg-emerald-400 transition-colors"
              >
                View Draft Plans
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-400">Currently Active</h3>
                    <p className="text-sm text-zinc-400">This plan is driving your daily execution dashboard.</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseActiveCycle}
                  className="flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-lg transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Close Cycle
                </button>
              </div>

              {/* Section 1: Global Settings */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider ml-1">Cycle Profile</h2>
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Cycle Name</label>
                    <input 
                      type="text" 
                      value={activeCycle.name} 
                      disabled
                      className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 opacity-80 cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date</label>
                      <input 
                        type="date" 
                        value={new Date(activeCycle.startDate).toISOString().split('T')[0]}
                        onChange={(e) => {
                          const newDate = new Date(e.target.value);
                          if (!isNaN(newDate.getTime())) {
                            setActiveCycle({ ...activeCycle, startDate: newDate.toISOString() });
                          }
                        }}
                        className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 [color-scheme:dark] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-2">End Date</label>
                      <input 
                        type="date" 
                        value={new Date(activeCycle.endDate).toISOString().split('T')[0]}
                        disabled
                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Tactics Matrix */}
              <section className="space-y-4">
                <div className="flex justify-between items-center ml-1">
                  <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Tactics Matrix</h2>
                  <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                    <Plus className="w-4 h-4" /> Add Tactic
                  </button>
                </div>

                {showAddForm && (
                  <div className="bg-zinc-900 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                    <input 
                      type="text" 
                      placeholder="Tactic Name (e.g. 2 hours of Deep Work)" 
                      value={newTacticName}
                      onChange={(e) => setNewTacticName(e.target.value)}
                      className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <div className="flex gap-4">
                      <select 
                        value={newTacticCategory}
                        onChange={(e) => setNewTacticCategory(e.target.value)}
                        className="flex-1 bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                        <option value="Health & Fitness">Health & Fitness</option>
                        <option value="Career & Business">Career & Business</option>
                        <option value="Finances">Finances</option>
                        <option value="Relationships & Family">Relationships & Family</option>
                        <option value="Personal Growth">Personal Growth</option>
                        <option value="Recreation & Fun">Recreation & Fun</option>
                        <option value="Physical Environment">Physical Environment</option>
                        <option value="Community & Contribution">Community & Contribution</option>
                        <option value="Spiritual & Faith">Spiritual & Faith</option>
                      </select>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-400">Weight:</span>
                        <span className="text-xl font-bold text-white w-4 text-center">{newTacticWeight}</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={newTacticWeight}
                      onChange={(e) => setNewTacticWeight(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mb-2"
                    />
                    <div className="flex gap-4 mb-2">
                      <button 
                        onClick={() => setNewTacticIndicatorType("LEAD")}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors border ${newTacticIndicatorType === "LEAD" ? "bg-emerald-500 text-zinc-950 border-emerald-500" : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"}`}
                      >
                        Lead Indicator
                      </button>
                      <button 
                        onClick={() => setNewTacticIndicatorType("LAG")}
                        className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors border ${newTacticIndicatorType === "LAG" ? "bg-indigo-500 text-zinc-950 border-indigo-500" : "bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500"}`}
                      >
                        Lag Indicator (Target)
                      </button>
                    </div>

                    {newTacticIndicatorType === "LEAD" ? (
                      <div className="flex items-center justify-between bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3">
                        <span className="text-sm font-medium text-zinc-400">Target Count (1-7 days/week):</span>
                        <input 
                          type="number" 
                          min="1" 
                          max="7" 
                          value={newTacticTargetCount}
                          onChange={(e) => setNewTacticTargetCount(parseInt(e.target.value, 10) || 1)}
                          className="w-16 bg-zinc-800 rounded-lg text-center text-white font-bold px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Target Value</label>
                          <input 
                            type="number" 
                            step="0.1"
                            value={newTacticTargetValue}
                            onChange={(e) => setNewTacticTargetValue(parseFloat(e.target.value) || 0)}
                            className="w-full bg-zinc-800 rounded-lg text-white font-bold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Unit (e.g. kg, $, pts)</label>
                          <input 
                            type="text" 
                            value={newTacticUnit}
                            onChange={(e) => setNewTacticUnit(e.target.value)}
                            className="w-full bg-zinc-800 rounded-lg text-white font-bold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                      <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                      <button onClick={handleAddTactic} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold rounded-lg transition-colors">Add Tactic</button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {activeCycle.tactics.map((t) => (
                    <div key={t.id} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-zinc-100">{t.name}</h3>
                          <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${getCategoryColor(t.category)}`}>
                            {getCategoryIcon(t.category)}
                            {t.category}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">Indicators</div>
                            <div className="text-xl font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-lg">{(t.indicators || []).length}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">Weight</div>
                            <div className="text-xl font-bold text-white bg-zinc-800 px-3 py-1 rounded-lg">{t.weight}</div>
                          </div>
                          <button onClick={() => handleDeleteTactic(t.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-2">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-white/5 space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-xs font-medium text-zinc-400">Adjust Tactic Weight (Impact)</label>
                            <span className="text-xs font-bold text-emerald-400">{t.weight}</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={t.weight}
                            onChange={(e) => updateWeight(t.id, parseInt(e.target.value, 10))}
                            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                          />
                        </div>
                        
                        <div className="space-y-2 mt-4">
                          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Indicators List</label>
                          <div className="space-y-2">
                            {(t.indicators || []).map(ind => (
                              <div key={ind.id} className="flex justify-between items-center bg-zinc-950/50 p-2 rounded-lg border border-white/5">
                                <span className="text-sm font-medium text-zinc-300 truncate mr-2">{ind.name}</span>
                                {ind.type === "LEAD" ? (
                                  <span className="text-xs font-bold bg-zinc-800 text-blue-400 px-2 py-1 rounded">{ind.targetCount}x / tuần</span>
                                ) : (
                                  <span className="text-xs font-bold bg-zinc-800 text-indigo-400 px-2 py-1 rounded">Mục tiêu: {ind.targetValue} {ind.unit}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section 3: Dynamic Score Preview */}
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider ml-1">Score Distribution</h2>
                <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-end gap-2 mb-6">
                      <span className="text-4xl font-bold text-emerald-400">{activeCycle.tactics.reduce((acc, t) => acc + t.weight, 0)}</span>
                      <span className="text-zinc-500 font-medium mb-1">Total Max Points</span>
                    </div>
                    
                    <div className="space-y-4">
                      {["Health & Fitness", "Career & Business", "Finances", "Relationships & Family", "Personal Growth", "Recreation & Fun", "Physical Environment", "Community & Contribution", "Spiritual & Faith"].map(cat => {
                        const catWeight = activeCycle.tactics.filter(t => t.category === cat).reduce((acc, t) => acc + t.weight, 0);
                        if (catWeight === 0) return null;
                        const percentage = Math.round((catWeight / activeCycle.tactics.reduce((acc, t) => acc + t.weight, 0)) * 100);
                        
                        return (
                          <div key={cat}>
                            <div className="flex justify-between text-sm font-medium mb-2">
                              <span className="capitalize text-zinc-300 flex items-center gap-2">
                                {getCategoryIcon(cat)} {cat}
                              </span>
                              <span className="text-zinc-500">{percentage}% ({catWeight} pts)</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${getCategoryColor(cat).split(' ')[0].replace('/10', '')}`} 
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="h-[250px] w-full flex items-center justify-center">
                    {(() => {
                      const pieData = ["Health & Fitness", "Career & Business", "Finances", "Relationships & Family", "Personal Growth", "Recreation & Fun", "Physical Environment", "Community & Contribution", "Spiritual & Faith"]
                        .map(cat => ({
                          name: cat.charAt(0).toUpperCase() + cat.slice(1),
                          value: activeCycle.tactics.filter(t => t.category === cat).reduce((acc, t) => acc + t.weight, 0),
                          color: getHexColor(cat)
                        }))
                        .filter(d => d.value > 0);

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                              itemStyle={{ color: '#fff' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </section>
            </div>
          )
        ) : (
          /* DRAFTS TAB (PLAN COMPARISON) */
          <div className="space-y-6 animate-in fade-in duration-300">
            {draftCycles.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-800">
                <Sparkles className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-zinc-300 mb-2">No Draft Plans</h3>
                <p className="text-zinc-500 mb-6">Go to the AI Goal Planner to generate some tactics.</p>
                <Link href="/" className="bg-orange-500 text-zinc-950 px-6 py-3 rounded-full font-bold hover:bg-orange-400 transition-colors inline-block">
                  Generate with AI
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {draftCycles.map((cycle) => (
                  <div key={cycle.id} className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/20 transition-colors" />
                    
                    <div className="relative z-10 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 block">Draft Plan #{cycle.id}</span>
                          <h3 className="text-xl font-bold text-white mb-2 leading-tight">{cycle.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-zinc-400">
                            <span className="flex items-center gap-1"><Target className="w-4 h-4"/> {cycle.tactics.length} Tactics</span>
                            <span>•</span>
                            <span>Max Points: {cycle.tactics.reduce((a, t) => a + t.weight, 0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Blocks comparison */}
                      <div className="bg-black/30 rounded-2xl p-4 mb-6 space-y-3 text-sm">
                        <div className="flex gap-3">
                          <Target className="w-5 h-5 text-indigo-400 shrink-0"/>
                          <p className="text-zinc-300"><span className="font-semibold text-zinc-500">Strategic:</span> {cycle.strategicBlockDesc}</p>
                        </div>
                        <div className="flex gap-3">
                          <Briefcase className="w-5 h-5 text-blue-400 shrink-0"/>
                          <p className="text-zinc-300"><span className="font-semibold text-zinc-500">Buffer:</span> {cycle.bufferBlockDesc}</p>
                        </div>
                        <div className="flex gap-3">
                          <Gamepad2 className="w-5 h-5 text-orange-400 shrink-0"/>
                          <p className="text-zinc-300"><span className="font-semibold text-zinc-500">Breakout:</span> {cycle.breakoutBlockDesc}</p>
                        </div>
                      </div>

                      {/* Top 3 Tactics Preview */}
                      <div className="space-y-2 mb-8">
                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Top Impact Tactics</h4>
                        {cycle.tactics.slice(0, 3).map((t, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-xl">
                            <div className="w-6 h-6 rounded-full bg-zinc-950 flex items-center justify-center text-xs font-bold text-zinc-500">
                              {t.weight}
                            </div>
                            <span className="text-sm font-medium text-zinc-200 line-clamp-1 flex-1">{t.name}</span>
                            <div className={getCategoryIcon(t.category).props.className + ` ${getCategoryColor(t.category).split(' ')[1]}`}>
                              {getCategoryIcon(t.category)}
                            </div>
                          </div>
                        ))}
                        {cycle.tactics.length > 3 && (
                          <div className="text-center text-xs text-zinc-500 pt-2 font-medium">
                            + {cycle.tactics.length - 3} more tactics
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 relative z-10">
                      <button 
                        onClick={() => setSelectedDraft(cycle)}
                        className="flex-1 bg-zinc-800 text-white hover:bg-zinc-700 py-4 rounded-xl font-bold transition-all active:scale-[0.98]"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleActivateCycle(cycle.id)}
                        className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 py-4 rounded-xl font-bold transition-all active:scale-[0.98]"
                      >
                        <Play className="w-5 h-5" />
                        Activate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Save Button - Only for Active Tab */}
      {activeTab === "active" && activeCycle && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none z-50">
          <div className="max-w-4xl mx-auto flex justify-end pointer-events-auto">
            <button 
              onClick={handleSaveActiveTactics}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-4 rounded-full font-bold shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50">
              <Save className="w-5 h-5" />
              {isSaving ? "Saving..." : "Save Active Config"}
            </button>
          </div>
        </div>
      )}

      {/* Draft Details Modal */}
      {selectedDraft && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-950 border border-zinc-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 md:p-8 shadow-2xl relative">
            <button 
              onClick={() => setSelectedDraft(null)}
              className="absolute top-6 right-6 p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
            
            <span className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 block">Draft Plan Details</span>
            <h2 className="text-3xl font-bold text-white mb-6 pr-12">{selectedDraft.name}</h2>
            
            <div className="bg-black/30 rounded-2xl p-5 mb-8 space-y-4 border border-white/5">
              <div className="flex gap-4">
                <Target className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5"/>
                <div>
                  <h4 className="font-semibold text-zinc-300 mb-1">Strategic Block</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{selectedDraft.strategicBlockDesc || "No description provided."}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Briefcase className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"/>
                <div>
                  <h4 className="font-semibold text-zinc-300 mb-1">Buffer Block</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{selectedDraft.bufferBlockDesc || "No description provided."}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Gamepad2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5"/>
                <div>
                  <h4 className="font-semibold text-zinc-300 mb-1">Breakout Block</h4>
                  <p className="text-zinc-500 text-sm leading-relaxed">{selectedDraft.breakoutBlockDesc || "No description provided."}</p>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-zinc-300 mb-4 flex items-center justify-between">
              <span>All Tactics ({selectedDraft.tactics.length})</span>
              <span className="text-sm font-medium text-zinc-500">Max Points: {selectedDraft.tactics.reduce((a, t) => a + t.weight, 0)}</span>
            </h3>
            
            <div className="space-y-3 mb-8">
              {selectedDraft.tactics.map(t => (
                <div key={t.id} className="bg-zinc-900/50 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-zinc-200">{t.name}</h4>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold uppercase tracking-wider ${getCategoryColor(t.category)}`}>
                      {getCategoryIcon(t.category)}
                      {t.category}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <div className="text-xs text-zinc-500 font-medium mb-1">Weight</div>
                    <div className="text-xl font-bold text-white bg-zinc-800 w-10 h-10 rounded-lg flex items-center justify-center">{t.weight}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 sticky bottom-0 pt-4 pb-2 bg-zinc-950">
              <button 
                onClick={() => setSelectedDraft(null)}
                className="flex-1 px-6 py-4 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setSelectedDraft(null);
                  handleActivateCycle(selectedDraft.id);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 px-6 py-4 rounded-xl font-bold transition-transform active:scale-[0.98]"
              >
                <Play className="w-5 h-5" /> Activate This Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
