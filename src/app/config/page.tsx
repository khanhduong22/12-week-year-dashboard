"use client";

import { useState } from "react";
import { ChevronLeft, Save, Plus, Target, BrainCircuit, Cpu, Dumbbell, Rocket } from "lucide-react";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";

export default function ConfigPage() {
  const [tactics, setTactics] = useState([
    { id: 1, name: "3 Giờ Deep Work (Linkpul)", category: "internal", weight: 5 },
    { id: 2, name: "2 Giờ học Claude Architect", category: "learning", weight: 4 },
    { id: 3, name: "Ngủ trước 9:00 PM", category: "health", weight: 3 },
    { id: 4, name: "Tập 5 bài Compound", category: "health", weight: 3 },
    { id: 5, name: "Ăn nhẹ trước tập", category: "health", weight: 1 },
  ]);

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
              <button className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                <Plus className="w-4 h-4" /> Add Tactic
              </button>
            </div>

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
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm text-zinc-400 font-medium">Weight</div>
                      <div className="text-2xl font-bold text-white">{t.weight}</div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Slider
                      value={[t.weight]}
                      onValueChange={(val) => updateWeight(t.id, (val as number[])[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
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
            <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6">
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
          </section>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none">
        <div className="max-w-3xl mx-auto flex justify-end pointer-events-auto">
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-6 py-4 rounded-full font-bold shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] transition-all active:scale-95">
            <Save className="w-5 h-5" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
