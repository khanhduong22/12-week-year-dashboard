'use client';

import React, { useState } from 'react';
import { Target, ArrowUpRight, Sparkles, X } from 'lucide-react';

interface Tactic {
  id: number;
  name: string;
}

interface PromoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
  sessionId: number;
  tactics: Tactic[];
  onPromoteSubmit: (sessionId: number, tacticId: number) => void;
}

export function PromoteModal({
  isOpen,
  onClose,
  sessionTitle,
  sessionId,
  tactics = [],
  onPromoteSubmit,
}: PromoteModalProps) {
  const [selectedTacticId, setSelectedTacticId] = useState<number | undefined>(
    tactics[0]?.id,
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTacticId) {
      alert('Vui lòng chọn một Tactic trong 12-Week Year!');
      return;
    }
    onPromoteSubmit(sessionId, selectedTacticId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 text-indigo-400">
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Chuyển đổi sang 12-Week Tactic</h3>
            <p className="text-xs text-slate-400">Biến phiên công việc đột xuất thành Lead Indicator</p>
          </div>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
          <span className="text-[11px] text-slate-400 block font-medium">Phiên Pomodoro được chọn:</span>
          <span className="text-sm font-bold text-emerald-300 block">{sessionTitle}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" />
              Chọn Tactic (Lead Indicator) chiến lược để gắn kết quả:
            </label>
            <select
              value={selectedTacticId || ''}
              onChange={(e) => setSelectedTacticId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {tactics.map((t) => (
                <option key={t.id} value={t.id}>
                  🎯 {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 space-y-1">
            <span className="font-bold block flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Tự động tính điểm Execution Score:
            </span>
            <p className="text-slate-300 text-[10px]">
              Khi bạn bấm xác nhận, phiên Pomodoro này sẽ được liên kết với Tactic chiến lược, tính điểm hoàn thành ngày (`TacticExecution`) và cập nhật Execution Score % của tuần!
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 transition-all shadow-md shadow-indigo-400/20"
            >
              Xác nhận chuyển đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
