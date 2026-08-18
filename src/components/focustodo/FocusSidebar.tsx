'use client';

import React from 'react';
import {
  Sun,
  Sunrise,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Target,
  Settings,
  Flame,
  Search,
} from 'lucide-react';

export type SmartViewType = 'today' | 'tomorrow' | 'this_week' | 'planned' | 'completed';

interface GoalFolder {
  id: number;
  name: string;
  category?: string;
  tactics?: Array<{ id: number; name: string }>;
}

interface FocusSidebarProps {
  activeView: SmartViewType | string;
  onSelectView: (view: SmartViewType | string, tacticId?: number) => void;
  goals?: GoalFolder[];
  counts?: {
    today?: number;
    tomorrow?: number;
    this_week?: number;
    planned?: number;
    completed?: number;
  };
  onOpenSettings?: () => void;
}

export function FocusSidebar({
  activeView,
  onSelectView,
  goals = [],
  counts = {},
  onOpenSettings,
}: FocusSidebarProps) {
  const smartItems = [
    { id: 'today', label: 'Today', icon: Sun, color: 'text-amber-400', count: counts.today || 0 },
    { id: 'tomorrow', label: 'Tomorrow', icon: Sunrise, color: 'text-orange-400', count: counts.tomorrow || 0 },
    { id: 'this_week', label: 'This Week', icon: Calendar, color: 'text-indigo-400', count: counts.this_week || 0 },
    { id: 'planned', label: 'Planned', icon: ClipboardList, color: 'text-emerald-400', count: counts.planned || 0 },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-slate-400', count: counts.completed || 0 },
  ];

  return (
    <aside className="w-64 bg-[#0f0f15] border-r border-slate-800/80 flex flex-col justify-between h-full p-4 select-none">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Brand / Profile Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide">Focus To-Do</h2>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                12-Week Edition
              </span>
            </div>
          </div>
        </div>

        {/* Quick Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full bg-[#181824] border border-slate-800/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
          />
        </div>

        {/* Smart Views Navigation */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
            Smart Views
          </span>
          {smartItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#222232] text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-white hover:bg-[#181824]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md">
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Projects / 12-Week Goals List */}
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              12-Week Goals & Tactics
            </span>
          </div>

          {goals.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic px-2">Chưa có Goal/Tactic nào.</p>
          ) : (
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {goals.map((goal) => (
                <div key={goal.id} className="space-y-0.5">
                  <div className="flex items-center gap-2 px-2 py-1 text-xs font-bold text-slate-300">
                    <Target className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{goal.name}</span>
                  </div>

                  {goal.tactics && goal.tactics.length > 0 && (
                    <div className="pl-4 space-y-0.5 border-l border-slate-800 ml-3">
                      {goal.tactics.map((tactic) => {
                        const isTacticActive = activeView === `tactic_${tactic.id}`;
                        return (
                          <button
                            key={tactic.id}
                            onClick={() => onSelectView(`tactic_${tactic.id}`, tactic.id)}
                            className={`w-full text-left px-2.5 py-1 text-[11px] rounded-lg truncate transition-all ${
                              isTacticActive
                                ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-[#181824]'
                            }`}
                          >
                            🎯 {tactic.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Options */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-[#181824] transition-all"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
