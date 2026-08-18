'use client';

import React from 'react';
import { Play, Check, Flag, Clock, Trash2 } from 'lucide-react';

export interface TaskItem {
  id: number;
  title: string;
  estimatedPomodoros: number;
  elapsedPomodoros: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  isCompleted: boolean;
  dueDate?: string;
  tactic?: {
    id: number;
    name: string;
  };
}

interface FocusTaskListProps {
  tasks: TaskItem[];
  activeTaskId?: number;
  onToggleComplete: (task: TaskItem) => void;
  onStartTimer: (task: TaskItem) => void;
  onDeleteTask?: (id: number) => void;
}

export function FocusTaskList({
  tasks = [],
  activeTaskId,
  onToggleComplete,
  onStartTimer,
  onDeleteTask,
}: FocusTaskListProps) {
  const getPriorityFlag = (p: TaskItem['priority']) => {
    switch (p) {
      case 'HIGH':
        return <Flag className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />;
      case 'MEDIUM':
        return <Flag className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />;
      case 'LOW':
        return <Flag className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />;
      default:
        return null;
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="p-12 text-center space-y-3 bg-[#181824]/40 border border-slate-800/60 rounded-2xl">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
          <Clock className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-bold text-slate-300">No Tasks</h4>
        <p className="text-xs text-slate-500">Click the input box above to add a new task</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const isActive = activeTaskId === task.id;

        return (
          <div
            key={task.id}
            className={`group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${
              isActive
                ? 'bg-[#222232] border-rose-500/50 shadow-md shadow-rose-500/10'
                : task.isCompleted
                ? 'bg-[#14141f]/60 border-slate-800/40 opacity-60'
                : 'bg-[#181824] border-slate-800/80 hover:border-slate-700'
            }`}
          >
            {/* Left Section: Checkbox + Title */}
            <div className="flex items-center gap-3.5 min-w-0 pr-4">
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => onToggleComplete(task)}
                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                  task.isCompleted
                    ? 'bg-rose-500 border-rose-500 text-slate-950 font-bold'
                    : 'border-slate-700 hover:border-rose-400 bg-[#0f0f15]'
                }`}
              >
                {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>

              {/* Title & Metadata */}
              <div className="min-w-0">
                <span
                  className={`text-xs font-semibold tracking-wide block truncate ${
                    task.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                  }`}
                >
                  {task.title}
                </span>

                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  {/* Tactic Tag */}
                  {task.tactic && (
                    <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.2 rounded-md">
                      🎯 {task.tactic.name}
                    </span>
                  )}

                  {/* Priority Flag */}
                  {getPriorityFlag(task.priority)}
                </div>
              </div>
            </div>

            {/* Right Section: 🍅 Pomodoro Count + Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Pomodoro Count Badge */}
              <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-300 bg-[#0f0f15] px-2.5 py-1 rounded-xl border border-slate-800/80">
                <Clock className="w-3.5 h-3.5 text-rose-400 fill-current" />
                <span>
                  {task.elapsedPomodoros}/{task.estimatedPomodoros}
                </span>
              </div>

              {/* Play Button */}
              {!task.isCompleted && (
                <button
                  type="button"
                  onClick={() => onStartTimer(task)}
                  className={`p-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-rose-500 text-slate-950 border-rose-400 font-bold shadow-md shadow-rose-500/20 animate-pulse'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Start Pomodoro Timer for this task"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              {/* Delete Button */}
              {onDeleteTask && (
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 rounded-xl text-slate-600 hover:text-rose-400 hover:bg-slate-900 border border-transparent transition-all opacity-0 group-hover:opacity-100"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
