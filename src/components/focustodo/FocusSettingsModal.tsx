'use client';

import React, { useState } from 'react';
import { X, Clock, Settings, Check } from 'lucide-react';

interface FocusSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FocusSettingsModal({ isOpen, onClose }: FocusSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'pomodoro' | 'projects'>('pomodoro');
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#181824] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex h-[500px]">
        {/* Left Tabs */}
        <div className="w-48 bg-[#0f0f15] border-r border-slate-800/80 p-4 space-y-1">
          <h3 className="text-sm font-black text-white px-3 mb-4">Settings</h3>
          {[
            { id: 'pomodoro', label: 'Pomodoro Timer', icon: Clock },
            { id: 'projects', label: 'Projects & Views', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'general' | 'pomodoro' | 'projects')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#222232] text-white border border-slate-700/80'
                    : 'text-slate-400 hover:text-white hover:bg-[#181824]'
                }`}
              >
                <Icon className="w-4 h-4 text-rose-400" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 p-6 flex flex-col justify-between overflow-y-auto relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[#222232]"
          >
            <X className="w-4 h-4" />
          </button>

          {activeTab === 'pomodoro' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white">Pomodoro Timer Settings</h4>
                <p className="text-xs text-slate-400">Customise timer duration and break intervals</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Pomodoro Duration (Minutes)</span>
                  <input
                    type="number"
                    value={pomodoroMinutes}
                    onChange={(e) => setPomodoroMinutes(Number(e.target.value))}
                    className="w-20 bg-[#0f0f15] border border-slate-800 rounded-xl px-3 py-1.5 text-center text-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Short Break Duration (Minutes)</span>
                  <input
                    type="number"
                    value={shortBreakMinutes}
                    onChange={(e) => setShortBreakMinutes(Number(e.target.value))}
                    className="w-20 bg-[#0f0f15] border border-slate-800 rounded-xl px-3 py-1.5 text-center text-white font-mono"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-300 font-semibold">Auto-start Breaks</span>
                  <button
                    onClick={() => setAutoStartBreaks(!autoStartBreaks)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors ${
                      autoStartBreaks ? 'bg-rose-500' : 'bg-slate-800'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        autoStartBreaks ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-white">Smart View Toggles</h4>
              <p className="text-xs text-slate-400">Show or hide specific sidebar lists</p>
              <div className="space-y-2 text-xs">
                {['Overdue', 'Tomorrow', 'This Week', 'High Priority', 'Planned', 'Completed'].map((item) => (
                  <div key={item} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f0f15] border border-slate-800/80">
                    <span className="text-slate-300 font-medium">{item}</span>
                    <Check className="w-4 h-4 text-rose-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-rose-500 hover:bg-rose-400"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
