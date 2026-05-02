"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Save, Plus, Target, BrainCircuit, Cpu, Dumbbell, Rocket } from "lucide-react";
import Link from "next/link";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function ConfigPage() {
  type Tactic = { id: number; name: string; category: string; weight: number; cycleId: number };
  
  const [tactics, setTactics] = useState<Tactic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTacticName, setNewTacticName] = useState("");
  const [newTacticCategory, setNewTacticCategory] = useState("value");
  const [newTacticWeight, setNewTacticWeight] = useState(3);

  useEffect(() => {
    const fetchTactics = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setTactics(data);
          } else {
            setTactics([
              { id: 1, name: "Luyện 2 bài LeetCode & System Design", category: "value", weight: 5, cycleId: 1 },
              { id: 2, name: "2 Giờ học Claude Architect", category: "learning", weight: 4, cycleId: 1 },
              { id: 3, name: "Ngủ trước 9:00 PM", category: "health", weight: 3, cycleId: 1 },
              { id: 4, name: "Tập 5 bài Compound", category: "health", weight: 3, cycleId: 1 },
            ]);
          }
        }
      } catch (e) {
        console.error("API Fetch Error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTactics();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      for (const t of tactics) {
        if (t.id < 0) {
          // New tactic added locally but not saved yet
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: t.name, category: t.category, weight: t.weight, cycleId: 1 })
          });
        } else {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics/${t.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ weight: t.weight })
          }).catch(() => {});
        }
      }
      alert("Configuration saved to database!");
      // Reload tactics to get real DB IDs
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics`);
      if (res.ok) setTactics(await res.json());
    } catch (e) {
      console.error(e);
      alert("Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTactic = () => {
    if (!newTacticName.trim()) return;
    const newTactic: Tactic = {
      id: -Date.now(), // temporary negative ID
      name: newTacticName,
      category: newTacticCategory,
      weight: newTacticWeight,
      cycleId: 1
    };
    setTactics([...tactics, newTactic]);
    setShowAddForm(false);
    setNewTacticName("");
    setNewTacticWeight(3);
  };

  const handleDeleteTactic = async (id: number) => {
    if (id > 0) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tactics/${id}`, {
          method: 'DELETE'
        });
      } catch (e) {
        console.error("Failed to delete tactic", e);
      }
    }
    setTactics(tactics.filter(t => t.id !== id));
  };

  const totalWeight = tactics.reduce((acc, t) => acc + t.weight, 0);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "internal": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "learning": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "health": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "value": return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      default: return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "internal": return <Cpu className="w-4 h-4" />;
      case "learning": return <BrainCircuit className="w-4 h-4" />;
      case "health": return <Dumbbell className="w-4 h-4" />;
      case "value": return <Rocket className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const updateWeight = (id: number, val: number) => {
    setTactics(tactics.map(t => t.id === id ? { ...t, weight: val } : t));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 font-sans selection:bg-zinc-800">
      <main className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-zinc-800/50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-zinc-400" />
          </Link>
          <div className="px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-sm font-medium">
            Setup Wizard
          </div>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Cycle Configuration</h1>
          <p className="text-zinc-400 font-medium">Define your 12 Week Year goals and weight your tactics.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20 text-emerald-500 animate-pulse font-semibold">
            Loading configuration...
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 1: Global Settings */}
          <section className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider ml-1">Global Settings</h2>
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 grid gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Cycle Name</label>
                <input 
                  type="text" 
                  defaultValue="Q4 - Mùa săn AI Architect" 
                  className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date</label>
                  <input 
                    type="date" 
                    defaultValue="2026-10-24"
                    className="w-full bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">End Date (Auto)</label>
                  <input 
                    type="date" 
                    defaultValue="2027-01-16"
                    disabled
                    className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-zinc-500 cursor-not-allowed [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Tactics & Weighting Matrix */}
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
                    <option value="internal">Internal Process</option>
                    <option value="learning">Learning</option>
                    <option value="health">Health</option>
                    <option value="value">Value</option>
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
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white">Cancel</button>
                  <button onClick={handleAddTactic} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-bold rounded-lg transition-colors">Add Tactic</button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {tactics.map((t) => (
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
                      <div>
                        <div className="text-sm text-zinc-400 font-medium">Weight</div>
                        <div className="text-2xl font-bold text-white">{t.weight}</div>
                      </div>
                      <button onClick={() => handleDeleteTactic(t.id)} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={t.weight}
                      onChange={(e) => updateWeight(t.id, parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between mt-2 text-xs text-zinc-500 font-medium px-1">
                      <span>Low Impact (1)</span>
                      <span>High Impact (5)</span>
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
                  <span className="text-4xl font-bold text-emerald-400">{totalWeight}</span>
                  <span className="text-zinc-500 font-medium mb-1">Total Max Points</span>
                </div>
                
                <div className="space-y-4">
                  {["internal", "learning", "health", "value"].map(cat => {
                    const catWeight = tactics.filter(t => t.category === cat).reduce((acc, t) => acc + t.weight, 0);
                    if (catWeight === 0) return null;
                    const percentage = Math.round((catWeight / totalWeight) * 100);
                    
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
                  const getHexColor = (cat: string) => {
                    switch (cat) {
                      case "internal": return "#a855f7"; // purple-500
                      case "learning": return "#3b82f6"; // blue-500
                      case "health": return "#22c55e"; // green-500
                      case "value": return "#f97316"; // orange-500
                      default: return "#71717a";
                    }
                  };
                  
                  const pieData = ["internal", "learning", "health", "value"]
                    .map(cat => ({
                      name: cat.charAt(0).toUpperCase() + cat.slice(1),
                      value: tactics.filter(t => t.category === cat).reduce((acc, t) => acc + t.weight, 0),
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
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto flex justify-end pointer-events-auto">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-4 rounded-full font-bold shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50">
            <Save className="w-5 h-5" />
            {isSaving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>
    </div>
  );
}
