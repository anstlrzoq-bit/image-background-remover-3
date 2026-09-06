import React from 'react';
import { Sun, Moon, ShieldCheck, Cpu } from 'lucide-react';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  isProcessing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 w-full border-b backdrop-blur-md transition-colors duration-200 border-slate-200/80 bg-white/90 dark:border-white/[0.08] dark:bg-[#0F172A]/90 h-[72px]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-extrabold tracking-[-0.5px] bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 dark:from-[#818CF8] dark:to-[#C084FC] bg-clip-text text-transparent">
                CLEARCUT.AI
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] hidden sm:block font-medium">
              실시간 클라이언트 AI 배경 제거 스튜디오
            </p>
          </div>
        </div>

        {/* Center / Right: Engine Status Badge + Privacy Badge + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* WASM Engine Pulse Badge from theme */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700 dark:text-[#94A3B8] bg-slate-100/80 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08]">
            <div className="status-pulse-dot" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">WASM Neural Engine</span>
            <span className="hidden md:inline text-emerald-600 dark:text-emerald-400 font-normal">Active</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% 온디바이스 실행</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={onToggleDarkMode}
            aria-label={darkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white/80 dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
