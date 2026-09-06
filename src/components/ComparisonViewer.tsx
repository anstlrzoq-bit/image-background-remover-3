import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Columns2, SlidersHorizontal, Eye, Maximize2, Minimize2 } from 'lucide-react';
import { ViewMode, ProcessedImageResult } from '../types';

interface ComparisonViewerProps {
  result: ProcessedImageResult;
  selectedBackground: { type: 'transparent' | 'color'; value: string };
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  darkMode: boolean;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  result,
  selectedBackground,
  viewMode,
  onChangeViewMode,
  darkMode,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showOriginalInToggle, setShowOriginalInToggle] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Handle slider drag calculation
  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const width = rect.width;
      const percentage = Math.max(0, Math.min(100, (x / width) * 100));
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX);
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  // Checkerboard CSS class based on theme
  const checkerboardClass = darkMode ? 'bg-checkered-dark' : 'bg-checkered-light';

  // Background style for cutout area
  const cutoutBgStyle: React.CSSProperties =
    selectedBackground.type === 'color'
      ? { backgroundColor: selectedBackground.value }
      : {};

  return (
    <div className={`w-full transition-all ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-slate-950/95 backdrop-blur-md flex flex-col justify-center' : ''}`}>
      {/* View Mode Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        {/* View Switcher Tabs - Styled to Professional Polish Theme */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]">
          <button
            id="view-mode-slider"
            type="button"
            onClick={() => onChangeViewMode('slider')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'slider'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>슬라이더 비교</span>
          </button>

          <button
            id="view-mode-side-by-side"
            type="button"
            onClick={() => onChangeViewMode('side-by-side')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'side-by-side'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>좌우 나란히</span>
          </button>

          <button
            id="view-mode-toggle"
            type="button"
            onClick={() => onChangeViewMode('toggle')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'toggle'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>단독 / 토글</span>
          </button>
        </div>

        {/* Info label & Fullscreen button */}
        <div className="flex items-center gap-2.5">
          {viewMode === 'slider' && (
            <span className="text-xs text-slate-500 dark:text-[#94A3B8] hidden sm:inline-block">
              중앙 구분선을 드래그하여 원본과 비교
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            aria-label={isFullscreen ? '전체화면 종료' : '전체화면 보기'}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.05] text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.1] transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Display Container */}
      {viewMode === 'slider' && (
        <div
          ref={containerRef}
          id="slider-container"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`relative select-none overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/[0.08] shadow-lg cursor-ew-resize max-h-[70vh] flex items-center justify-center bg-slate-900/5 ${
            selectedBackground.type === 'transparent' ? checkerboardClass : ''
          }`}
          style={cutoutBgStyle}
        >
          {/* Result Image Layer (Underneath right-hand side) */}
          <div className="relative w-full h-full flex items-center justify-center max-h-[70vh]">
            <img
              src={result.resultUrl}
              alt="배경 제거 결과"
              className="max-h-[70vh] w-auto max-w-full object-contain pointer-events-none mx-auto"
            />
          </div>

          {/* Original Image Layer (Clipped to left side according to sliderPosition) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
            style={{
              clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={result.originalUrl}
                alt="원본 이미지"
                className="max-h-[70vh] w-auto max-w-full object-contain pointer-events-none mx-auto"
              />
            </div>
          </div>

          {/* Divider Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.6)] z-20 pointer-events-none"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Draggable Circle Handle styled per theme */}
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#6366F1] text-white shadow-[0_0_16px_rgba(99,102,241,0.6)] flex items-center justify-center border-2 border-white transition-transform hover:scale-110 active:scale-95">
              <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          {/* Floating Theme Badges */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-[0.5px] bg-black/65 backdrop-blur-sm text-white border border-white/15">
              ORIGINAL
            </span>
          </div>
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-[0.5px] bg-indigo-600/90 backdrop-blur-sm text-white border border-indigo-300/30">
              REMOVED
            </span>
          </div>
        </div>
      )}

      {/* Side-by-Side View */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Original */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/[0.08] bg-slate-100 dark:bg-[#1E293B] shadow-md p-4 flex flex-col items-center justify-center min-h-[350px]">
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-[0.5px] bg-black/65 text-white backdrop-blur-sm border border-white/15">
              ORIGINAL
            </span>
            <img
              src={result.originalUrl}
              alt="원본"
              className="max-h-[55vh] w-auto max-w-full object-contain rounded-lg"
            />
          </div>

          {/* Right: Cutout Result */}
          <div
            className={`relative rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/[0.08] shadow-md p-4 flex flex-col items-center justify-center min-h-[350px] ${
              selectedBackground.type === 'transparent' ? checkerboardClass : ''
            }`}
            style={cutoutBgStyle}
          >
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-[0.5px] bg-[#6366F1] text-white shadow-sm border border-indigo-400/30">
              REMOVED
            </span>
            <img
              src={result.resultUrl}
              alt="배경 제거 결과"
              className="max-h-[55vh] w-auto max-w-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Toggle View */}
      {viewMode === 'toggle' && (
        <div className="flex flex-col items-center">
          <div
            className={`relative w-full rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/[0.08] shadow-lg p-4 flex items-center justify-center min-h-[400px] max-h-[70vh] ${
              !showOriginalInToggle && selectedBackground.type === 'transparent'
                ? checkerboardClass
                : ''
            }`}
            style={!showOriginalInToggle ? cutoutBgStyle : {}}
          >
            <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-[0.5px] bg-black/70 text-white backdrop-blur-sm border border-white/15">
              {showOriginalInToggle ? 'ORIGINAL' : 'REMOVED'}
            </span>

            <img
              src={showOriginalInToggle ? result.originalUrl : result.resultUrl}
              alt={showOriginalInToggle ? '원본' : '배경 제거 결과'}
              className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg transition-opacity duration-150"
            />
          </div>

          {/* Hold or Click Switch Button */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onMouseDown={() => setShowOriginalInToggle(true)}
              onMouseUp={() => setShowOriginalInToggle(false)}
              onTouchStart={() => setShowOriginalInToggle(true)}
              onTouchEnd={() => setShowOriginalInToggle(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/[0.1] bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-800 dark:text-[#F8FAFC] text-xs font-semibold shadow-sm flex items-center gap-2 select-none"
            >
              <Eye className="w-4 h-4 text-indigo-500" />
              <span>누르고 있는 동안 원본 확인 (Hold)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowOriginalInToggle(!showOriginalInToggle)}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
            >
              클릭하여 원본/결과 토글
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
