'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Volume2,
  Sparkles,
  X,
  Maximize2,
  FileText,
  Bell,
  BellOff,
} from 'lucide-react';

interface PersistentBottomTimerBarProps {
  activeTask?: { id: number; title: string } | null;
  onSessionFinish?: (data: { outputSummary: string }) => void;
}

export function PersistentBottomTimerBar({
  activeTask,
  onSessionFinish,
}: PersistentBottomTimerBarProps) {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showFullFocusModal, setShowFullFocusModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [outputSummary, setOutputSummary] = useState('');
  const [quickNote, setQuickNote] = useState('');
  const [showQuickNotePopover, setShowQuickNotePopover] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [notiPermission, setNotiPermission] = useState<NotificationPermission>('default');

  // Request Browser Notification Permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotiPermission(Notification.permission);
    }
  }, []);

  const requestNotiPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      setNotiPermission(res);
    }
  };

  // Web Audio Synthesizer Chime Sound
  const triggerCompletionAlert = (taskTitle: string) => {
    // 1. Play Audio Chime (Web Audio API)
    try {
      const AudioCtx = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      }
    } catch (e) {
      console.error('Audio play error:', e);
    }

    // 2. Trigger Browser Desktop Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🍅 Hoàn thành 25 phút Pomodoro!', {
        body: `Phiên tập trung cho "${taskTitle}" đã kết thúc. Hãy lưu lại kết quả!`,
        icon: '🍅',
      });
    }
  };

  // When activeTask changes, reset timer to 25m and auto-start
  useEffect(() => {
    if (activeTask) {
      setMinutes(25);
      setSeconds(0);
      setIsRunning(true);
      setQuickNote('');
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => setNotiPermission(perm));
      }
    }
  }, [activeTask]);

  // Robust countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        setSeconds((prevSec) => {
          if (prevSec > 0) {
            return prevSec - 1;
          } else {
            setMinutes((prevMin) => {
              if (prevMin > 0) {
                return prevMin - 1;
              } else {
                // 25 minutes finished!
                setIsRunning(false);
                triggerCompletionAlert(activeTask?.title || 'Focus Session');
                setOutputSummary((prev) => prev || quickNote);
                setShowOutputModal(true);
                return 0;
              }
            });
            return 59;
          }
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, activeTask, quickNote]);

  const togglePlayPause = () => {
    if (!isRunning && notiPermission === 'default') {
      requestNotiPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(25);
    setSeconds(0);
  };

  const handleFinishEarly = () => {
    setIsRunning(false);
    triggerCompletionAlert(activeTask?.title || 'Focus Session');
    setOutputSummary((prev) => prev || quickNote);
    setShowOutputModal(true);
  };

  const handleFinishSubmit = () => {
    const finalNote = outputSummary.trim() || quickNote.trim();
    if (!finalNote) {
      alert('Vui lòng nhập tóm tắt kết quả phiên tập trung!');
      return;
    }
    if (onSessionFinish) {
      onSessionFinish({ outputSummary: finalNote });
    }
    setShowOutputModal(false);
    setOutputSummary('');
    setQuickNote('');
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

  const activeTaskTitle = activeTask?.title || 'Focus Session';

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#181824]/95 border border-slate-700/80 rounded-full px-5 py-2.5 shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-slideUp">
        {/* Ring / Timer Badge */}
        <div className="flex items-center gap-2 bg-[#0f0f15] border border-slate-800 px-3 py-1 rounded-full font-mono text-sm font-black text-rose-400">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
          {formatDigits(minutes, seconds)}
        </div>

        {/* Task Title */}
        <div className="max-w-[160px] sm:max-w-[240px] truncate text-xs font-semibold text-slate-200">
          {activeTaskTitle}
        </div>

        {/* Play/Pause Button */}
        <button
          type="button"
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

        {/* Early Finish Button */}
        {isRunning && (
          <button
            type="button"
            onClick={handleFinishEarly}
            className="px-3 py-1 rounded-full text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
            title="Finish Pomodoro session early"
          >
            Finish
          </button>
        )}

        {/* Quick Note Toggle Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowQuickNotePopover(!showQuickNotePopover)}
            className={`p-2 rounded-full transition-all relative ${
              quickNote.trim()
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Quick Note / Scratchpad"
          >
            <FileText className="w-4 h-4" />
            {quickNote.trim() && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* Quick Note Popover */}
          {showQuickNotePopover && (
            <div className="absolute bottom-12 right-0 w-72 bg-[#181824] border border-slate-700 rounded-2xl p-3 shadow-2xl space-y-2 animate-fadeIn z-50">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Quick Note / Ghi chú nhanh
                </span>
                <button
                  type="button"
                  onClick={() => setShowQuickNotePopover(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={3}
                placeholder="Nhập nhanh suy nghĩ, dòng code hoặc kết quả đang làm..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full bg-[#0f0f15] border border-slate-800 rounded-xl p-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
              />
              <div className="text-[10px] text-slate-500">
                💡 Ghi chú này sẽ tự động điền vào báo cáo khi kết thúc Pomodoro.
              </div>
            </div>
          )}
        </div>

        {/* Browser Notification Bell Toggle */}
        <button
          type="button"
          onClick={requestNotiPermission}
          className={`p-2 rounded-full transition-all ${
            notiPermission === 'granted'
              ? 'text-rose-400 hover:bg-slate-800'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
          title={
            notiPermission === 'granted'
              ? 'Thông báo trình duyệt đang bật'
              : 'Bật thông báo trình duyệt khi xong Pomodoro'
          }
        >
          {notiPermission === 'granted' ? (
            <Bell className="w-4 h-4 fill-current" />
          ) : (
            <BellOff className="w-4 h-4" />
          )}
        </button>

        {/* Expand / Fullscreen Focus Mode */}
        <button
          type="button"
          onClick={() => setShowFullFocusModal(true)}
          className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          title="Fullscreen Focus Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Fullscreen Focus Mode Overlay */}
      {showFullFocusModal && (
        <div className="fixed inset-0 z-50 bg-[#0f0f15] text-white flex flex-col items-center justify-between p-6 md:p-8 animate-fadeIn">
          {/* Top Bar */}
          <div className="w-full max-w-5xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              Focus Mode
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={requestNotiPermission}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  notiPermission === 'granted'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-[#181824] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                {notiPermission === 'granted' ? 'Noti On' : 'Enable Noti'}
              </button>

              <button
                type="button"
                onClick={() => setShowFullFocusModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Center Giant Timer & Quick Note Scratchpad */}
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center py-4">
            {/* Giant Timer & Controls (Left/Center) */}
            <div className="md:col-span-7 text-center space-y-6">
              <h2 className="text-xl md:text-2xl font-bold text-slate-300 max-w-xl mx-auto">
                {activeTaskTitle}
              </h2>

              <div className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-widest text-rose-500 drop-shadow-[0_0_35px_rgba(244,63,94,0.3)]">
                {formatDigits(minutes, seconds)}
              </div>

              {/* Ambient Sound Selector */}
              <div className="flex items-center justify-center gap-2 pt-2">
                <Volume2 className="w-4 h-4 text-slate-500" />
                {sounds.map((snd) => (
                  <button
                    key={snd.id}
                    type="button"
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
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={togglePlayPause}
                  className="px-8 py-3 rounded-2xl bg-rose-500 text-slate-950 font-black text-lg hover:bg-rose-400 shadow-xl shadow-rose-500/20 transition-all"
                >
                  {isRunning ? 'PAUSE' : 'START FOCUS'}
                </button>
                <button
                  type="button"
                  onClick={handleFinishEarly}
                  className="px-6 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold hover:bg-emerald-500/30 transition-all"
                >
                  FINISH EARLY
                </button>
                <button
                  type="button"
                  onClick={resetTimer}
                  className="p-3 rounded-2xl bg-[#181824] border border-slate-800 text-slate-400 hover:text-white"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Note Scratchpad Card (Right) */}
            <div className="md:col-span-5 bg-[#181824] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Quick Note / Scratchpad
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Auto-synced</span>
              </div>

              <textarea
                rows={8}
                placeholder="Ghi nhanh suy nghĩ, ý tưởng, những gì đang làm hoặc kết quả phiên Pomodoro..."
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                className="w-full bg-[#0f0f15] border border-slate-800/80 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
              />

              <div className="text-[11px] text-slate-400 leading-normal bg-amber-500/5 border border-amber-500/15 rounded-xl p-2.5">
                💡 <strong>Mẹo:</strong> Những gì bạn nhập ở đây sẽ tự động điền vào báo cáo tổng kết khi hết 25 phút Pomodoro!
              </div>
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
              rows={4}
              placeholder="Tóm tắt những gì bạn vừa hoàn thành trong phiên tập trung này..."
              value={outputSummary || quickNote}
              onChange={(e) => setOutputSummary(e.target.value)}
              className="w-full bg-[#0f0f15] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowOutputModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Bỏ qua
              </button>
              <button
                type="button"
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
