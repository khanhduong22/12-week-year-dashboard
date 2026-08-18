'use client';

import React, { useState } from 'react';
import { Plus, Flag, Clock, Target } from 'lucide-react';

interface TacticOption {
  id: number;
  name: string;
}

interface InlineTaskInputProps {
  onAddTask: (task: {
    title: string;
    estimatedPomodoros: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    tacticId?: number;
  }) => void;
  tactics?: TacticOption[];
  currentViewLabel?: string;
}

export function InlineTaskInput({
  onAddTask,
  tactics = [],
  currentViewLabel = 'Tasks',
}: InlineTaskInputProps) {
  const [title, setTitle] = useState('');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [priority, setPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'>('NONE');
  const [selectedTacticId, setSelectedTacticId] = useState<number | undefined>(undefined);
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      estimatedPomodoros,
      priority,
      tacticId: selectedTacticId,
    });

    setTitle('');
    setEstimatedPomodoros(1);
    setPriority('NONE');
    setSelectedTacticId(undefined);
  };

  const getPriorityColor = (p: typeof priority) => {
    switch (p) {
      case 'HIGH':
        return 'text-rose-500 fill-rose-500/20';
      case 'MEDIUM':
        return 'text-amber-500 fill-amber-500/20';
      case 'LOW':
        return 'text-emerald-500 fill-emerald-500/20';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#181824] border border-slate-800/80 rounded-2xl p-3 space-y-3 shadow-lg focus-within:border-rose-500/50 transition-all"
    >
      <div className="flex items-center gap-3">
        <Plus className="w-5 h-5 text-slate-500 shrink-0" />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setShowOptions(true)}
          placeholder={`Add a task to "${currentViewLabel}", press 「Enter」 to save`}
          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
        />

        {/* Quick Pomodoro Estimator (🍅 1 - 5) */}
        <div className="flex items-center gap-1 bg-[#0f0f15] px-2 py-1 rounded-xl border border-slate-800 shrink-0">
          {[1, 2, 3, 4, 5].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setEstimatedPomodoros(count)}
              className={`p-1 rounded transition-all ${
                count <= estimatedPomodoros
                  ? 'text-rose-400 scale-110'
                  : 'text-slate-600 hover:text-slate-400'
              }`}
              title={`Estimate ${count} Pomodoros (${count * 25} mins)`}
            >
              <Clock className="w-3.5 h-3.5 fill-current" />
            </button>
          ))}
          <span className="text-[10px] font-mono text-rose-400 ml-1 font-bold">
            {estimatedPomodoros * 25}m
          </span>
        </div>
      </div>

      {/* Expanded Controls Options */}
      {showOptions && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 animate-fadeIn">
          <div className="flex items-center gap-3">
            {/* Priority Selector */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 mr-1 font-medium">Priority:</span>
              {(['NONE', 'LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`p-1 rounded-lg border transition-all ${
                    priority === p
                      ? 'bg-slate-800 border-slate-700'
                      : 'border-transparent hover:bg-slate-900'
                  }`}
                  title={`Priority: ${p}`}
                >
                  <Flag className={`w-3.5 h-3.5 ${getPriorityColor(p)}`} />
                </button>
              ))}
            </div>

            {/* Tactic Alignment Selector */}
            {tactics.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <select
                  value={selectedTacticId || ''}
                  onChange={(e) => setSelectedTacticId(e.target.value ? Number(e.target.value) : undefined)}
                  className="bg-[#0f0f15] border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none"
                >
                  <option value="">-- Align 12-Week Tactic --</option>
                  {tactics.map((t) => (
                    <option key={t.id} value={t.id}>
                      🎯 {t.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowOptions(false)}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-1 text-xs font-bold text-slate-950 bg-rose-500 hover:bg-rose-400 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-rose-500/20"
            >
              Save Task
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
