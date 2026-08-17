'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Tag as TagIcon, Target, Sparkles, Clock } from 'lucide-react';

interface Tactic {
  id: number;
  name: string;
}

interface PomodoroTimerWidgetProps {
  tactics?: Tactic[];
  onSessionComplete?: (data: { title: string; durationMinutes: number; tacticId?: number; tags: string[]; outputSummary: string; reflectionNotes?: string }) => void;
}

export function PomodoroTimerWidget({ tactics = [], onSessionComplete }: PomodoroTimerWidgetProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedTacticId, setSelectedTacticId] = useState<number | undefined>(undefined);
  const [selectedTags, setSelectedTags] = useState<string[]>(['#deepwork']);
  const [customTagInput, setCustomTagInput] = useState('');

  // Complete modal state
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [outputSummary, setOutputSummary] = useState('');
  const [reflectionNotes, setReflectionNotes] = useState('');

  const defaultTags = ['#backend', '#frontend', '#refactoring', '#deepwork', '#unplanned'];

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds((prev) => prev - 1);
        } else if (minutes > 0) {
          setMinutes((prev) => prev - 1);
          setSeconds(59);
        } else {
          setIsRunning(false);
          setShowCompleteModal(true);
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, minutes, seconds]);

  const handleStartPause = () => {
    if (!taskTitle.trim()) {
      alert('Vui lòng nhập tên công việc/phiên tập trung!');
      return;
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(selectedDuration);
    setSeconds(0);
  };

  const handleDurationChange = (mins: number) => {
    setSelectedDuration(mins);
    if (!isRunning) {
      setMinutes(mins);
      setSeconds(0);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTagInput.trim()) {
      const formatted = customTagInput.startsWith('#') ? customTagInput.trim() : `#${customTagInput.trim()}`;
      if (!selectedTags.includes(formatted)) {
        setSelectedTags([...selectedTags, formatted]);
      }
      setCustomTagInput('');
    }
  };

  const handleCompleteSubmit = () => {
    if (!outputSummary.trim()) {
      alert('Vui lòng nhập tóm tắt những gì đã làm được!');
      return;
    }

    if (onSessionComplete) {
      onSessionComplete({
        title: taskTitle || 'Phiên Pomodoro tập trung',
        durationMinutes: selectedDuration,
        tacticId: selectedTacticId,
        tags: selectedTags,
        outputSummary,
        reflectionNotes,
      });
    }

    setShowCompleteModal(false);
    setOutputSummary('');
    setReflectionNotes('');
    handleReset();
    setTaskTitle('');
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-6 backdrop-blur-xl shadow-2xl transition-all duration-300">
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">Pomodoro Focus Timer</h3>
            <p className="text-xs text-slate-400">Theo dõi năng suất & Deep Work realtime</p>
          </div>
        </div>

        {/* Duration Selectors */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => handleDurationChange(mins)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                selectedDuration === mins
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Area */}
      <div className="space-y-4 mb-6">
        {/* Task Title Input */}
        <div>
          <input
            type="text"
            placeholder="Bạn đang chuẩn bị làm gì? (VD: Code Module Analytics...)"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            disabled={isRunning}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
        </div>

        {/* Tactic / Strategy Alignment */}
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400 shrink-0" />
          <select
            value={selectedTacticId || ''}
            onChange={(e) => setSelectedTacticId(e.target.value ? Number(e.target.value) : undefined)}
            disabled={isRunning}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="">-- Gắn với Tactic 12-Week Year (Tùy chọn) --</option>
            {tactics.map((t) => (
              <option key={t.id} value={t.id}>
                🎯 {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <TagIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          {defaultTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                selectedTags.includes(tag)
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-medium'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
          <input
            type="text"
            placeholder="+ Tag..."
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={handleAddCustomTag}
            className="bg-transparent border-none text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none w-16"
          />
        </div>
      </div>

      {/* Main Timer Display */}
      <div className="flex flex-col items-center justify-center my-6 py-6 rounded-2xl bg-gradient-to-b from-slate-950/80 to-slate-900/50 border border-slate-800/80 relative overflow-hidden">
        <div className="text-6xl font-black tracking-widest text-white font-mono drop-shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          {formatTime(minutes, seconds)}
        </div>

        <div className="mt-2 text-xs font-medium text-emerald-400/90 flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
          {isRunning ? 'Đang trong phiên tập trung...' : 'Sẵn sàng bắt đầu'}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleStartPause}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg ${
              isRunning
                ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 hover:bg-emerald-400'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'Tạm dừng' : 'Bắt đầu ngay'}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700/50 transition-all"
            title="Đặt lại đồng hồ"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCompleteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-xs font-semibold transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Hoàn thành ngay
          </button>
        </div>
      </div>

      {/* Completion Output Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-bold text-white">Ghi nhận kết quả phiên Pomodoro</h3>
            </div>
            <p className="text-xs text-slate-400">
              Tuyệt vời! Bạn vừa hoàn thành {selectedDuration} phút tập trung cho: <span className="text-emerald-300 font-semibold">{taskTitle || 'Phiên làm việc'}</span>
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tóm tắt thành quả/kết quả thực tế đạt được <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="VD: Đã code xong API auth JWT, thêm 3 unit tests pass 100%..."
                value={outputSummary}
                onChange={(e) => setOutputSummary(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Ghi chú/Bài học/Vấn đề gặp phải (Tùy chọn)
              </label>
              <input
                type="text"
                placeholder="VD: Cần tối ưu thêm query Redis ở phiên sau..."
                value={reflectionNotes}
                onChange={(e) => setReflectionNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleCompleteSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-400/20"
              >
                Lưu kết quả & Đánh dấu xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
