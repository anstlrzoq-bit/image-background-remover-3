import React from 'react';
import { Loader2, Cpu, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { ProcessProgress } from '../types';

interface ProcessingOverlayProps {
  progress: ProcessProgress;
  originalPreviewUrl: string | null;
}

export const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  progress,
  originalPreviewUrl,
}) => {
  const { stage, percent, message, timeElapsedMs } = progress;
  const elapsedSec = timeElapsedMs ? (timeElapsedMs / 1000).toFixed(1) : '0.0';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 flex flex-col items-center justify-center animate-fade-in">
      {/* Scanner Card */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#1E293B] p-8 sm:p-10 shadow-xl">
        {/* Subtle ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        {/* Image Preview with Scanning beam */}
        {originalPreviewUrl && (
          <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden border border-slate-200 dark:border-white/[0.1] shadow-inner mb-8 bg-slate-100 dark:bg-[#0F172A]">
            <img
              src={originalPreviewUrl}
              alt="Processing Preview"
              className="w-full h-full object-cover filter blur-[0.5px]"
            />
            {/* Holographic scanning line effect */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_12px_#6366f1] animate-[scan_2s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay" />
          </div>
        )}

        {/* Spinner & Stage Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-white/[0.05] text-indigo-600 dark:text-[#818CF8] mb-3 border border-indigo-100 dark:border-white/[0.08] shadow-sm">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
            AI가 배경을 분리하고 있습니다
          </h3>
          <p className="text-sm font-medium text-indigo-600 dark:text-[#818CF8] mt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 animate-pulse" />
            {message || '작업을 진행 중입니다...'}
          </p>
        </div>

        {/* Progress Bar with Polish Theme glow */}
        <div className="w-full space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              신경망 연산 진행도
            </span>
            <span className="text-indigo-600 dark:text-[#818CF8] font-mono text-sm font-bold">
              {percent}%
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/[0.1] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#6366F1] shadow-[0_0_12px_rgba(99,102,241,0.7)] transition-all duration-300 ease-out"
              style={{ width: `${Math.max(5, percent)}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-[#94A3B8] pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              경과 시간: {elapsedSec}초
            </span>
            <span>WASM On-Device Processing</span>
          </div>
        </div>

        {/* Warm User Note */}
        <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] p-3.5 border border-slate-200/70 dark:border-white/[0.06] text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed text-center">
          💡 최초 1회 실행 시 브라우저 내 AI 모델 가속 엔진을 초기화하므로 약간의 시간이 소요될 수 있습니다.
          이후 작업은 즉시 초고속으로 처리됩니다.
        </div>
      </div>
    </div>
  );
};
