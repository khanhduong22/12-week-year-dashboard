'use client';

import React from 'react';

interface TopMetricsBarProps {
  estimatedTimeText?: string;
  tasksToBeCompleted?: number;
  elapsedTimeText?: string;
  completedTasks?: number;
}

export function TopMetricsBar({
  estimatedTimeText = '0m',
  tasksToBeCompleted = 0,
  elapsedTimeText = '0m',
  completedTasks = 0,
}: TopMetricsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 rounded-2xl bg-[#181824] border border-slate-800/80 shadow-md">
      {/* Metric 1: Estimated Time */}
      <div className="text-center space-y-1">
        <div className="text-2xl font-black text-rose-400 font-mono">
          {estimatedTimeText}
        </div>
        <div className="text-[11px] font-medium text-slate-400">
          Estimated Time
        </div>
      </div>

      {/* Metric 2: Tasks to be Completed */}
      <div className="text-center space-y-1 border-l border-slate-800/80">
        <div className="text-2xl font-black text-rose-400 font-mono">
          {tasksToBeCompleted}
        </div>
        <div className="text-[11px] font-medium text-slate-400">
          Tasks to be Completed
        </div>
      </div>

      {/* Metric 3: Elapsed Time */}
      <div className="text-center space-y-1 border-l border-slate-800/80">
        <div className="text-2xl font-black text-rose-400 font-mono">
          {elapsedTimeText}
        </div>
        <div className="text-[11px] font-medium text-slate-400">
          Elapsed Time
        </div>
      </div>

      {/* Metric 4: Completed Tasks */}
      <div className="text-center space-y-1 border-l border-slate-800/80">
        <div className="text-2xl font-black text-rose-400 font-mono">
          {completedTasks}
        </div>
        <div className="text-[11px] font-medium text-slate-400">
          Completed Tasks
        </div>
      </div>
    </div>
  );
}
