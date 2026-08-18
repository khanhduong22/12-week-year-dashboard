'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle2, Volume2, Sparkles, X, Maximize2 } from 'lucide-react';

interface PersistentBottomTimerBarProps {
  activeTaskTitle?: string;
  onSessionFinish?: (data: { outputSummary: string }) => void;
}

export function PersistentBottomTimerBar({
  activeTaskTitle = 'Focus Session',
  onSessionFinish,
}: PersistentBottomTimerBarProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showFullFocusModal, setShowFullFocusModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [outputSummary, setOutputSummary] = useState('');
  const [activeSound, setActiveSound] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds((s) => s - 1);
        } else if (minutes > 0) {
          setMinutes((m) => m - 1);
          setSeconds(59);
        } else {
          setIsRunning(false);
          setShowOutputModal(true);
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, minutes, seconds]);

  const togglePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
  };

  const handleFinishSubmit = () => {
    if (!outputSummary.trim()) {
      alert('Vui lòng nhập tóm tắt kết quả phiên tập trung!');
      return;
    }
    if (onSessionFinish) {
      onSessionFinish({ outputSummary });
    }
    setShowOutputModal(false);
    setOutputSummary('');
    resetTimer();
  };

  const formatDigits = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sounds = [
    { id: 'forest', name: '🌲 Deep Forest' },
    { id: 'rain', name: '🌧️ Heavy Rain' },
    { id: 'coffee', name: '☕ Coffee Shop' },
  ];

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#181824]/95 border border-slate-700/80 rounded-full px-5 py-2.5 shadow-2xl backdrop-blur-xl flex items-center gap-4 border-slate-700 animate-slideUp">
        {/* Ring / Timer Badge */}
        <div className="flex items-center gap-2 bg-[#0f0f15] border border-slate-800 px-3 py-1 rounded-full font-mono text-sm font-black text-rose-400">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
          {formatDigits(minutes, seconds)}
        </div>

        {/* Task Title */}
        <div className="max-w-[200px] sm:max-w-[300px] truncate text-xs font-semibold text-slate-200">
          {activeTaskTitle}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all shadow-md ${
            isRunning
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
              : 'bg-rose-500 text-slate-950 shadow-rose-500/20 hover:bg-rose-400'
          }`}
          title={isRunning ? 'Pause' : 'Start'}
        >
          {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>

        {/* Expand / Fullscreen Focus Mode */}
        <button
          onClick={() => setShowFullFocusModal(true)}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Fullscreen Focus Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Fullscreen Focus Mode Overlay */}
      {showFullFocusModal && (
        <div className="fixed inset-0 z-50 bg-[#0f0f15] text-white flex flex-col items-center justify-between p-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="w-full max-w-4xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              Focus Mode
            </div>
            <button
              onClick={() => setShowFullFocusModal(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Center Giant Timer */}
          <div className="text-center space-y-6">
            <h2 className="text-xl md:text-2xl font-bold text-slate-300 max-w-xl mx-auto">
              {activeTaskTitle}
            </h2>

            <div className="text-8xl md:text-9xl font-black font-mono tracking-widest text-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.3)]">
              {formatDigits(minutes, seconds)}
            </div>

            {/* Ambient Sound Selector */}
            <div className="flex items-center justify-center gap-2 pt-4">
              <Volume2 className="w-4 h-4 text-slate-500" />
              {sounds.map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => setActiveSound(activeSound === snd.id ? null : snd.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                    activeSound === snd.id
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : 'bg-[#181824] text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {snd.name}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={togglePlayPause}
                className="px-8 py-3 rounded-2xl bg-rose-500 text-slate-950 font-black text-lg hover:bg-rose-400 shadow-xl shadow-rose-500/20 transition-all"
              >
                {isRunning ? 'PAUSE' : 'START FOCUS'}
              </button>
              <button
                onClick={resetTimer}
                className="p-3 rounded-2xl bg-[#181824] border border-slate-800 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Stay focused. Achieve your 12-Week Goals.
          </div>
        </div>
      )}

      {/* Output Log Modal */}
      {showOutputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#181824] border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold">
              <CheckCircle2 className="w-5 h-5" />
              Ghi nhận thành quả phiên Pomodoro
            </div>

            <textarea
              rows={3}
              placeholder="Tóm tắt những gì bạn vừa hoàn thành..."
              value={outputSummary}
              onChange={(e) => setOutputSummary(e.target.value)}
              className="w-full bg-[#0f0f15] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowOutputModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Bỏ qua
              </button>
              <button
                onClick={handleFinishSubmit}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-rose-400 hover:bg-rose-300"
              >
                Lưu thành quả
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
