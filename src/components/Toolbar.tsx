import React, { useState } from 'react';
import {
  Download,
  RotateCcw,
  Copy,
  Check,
  Palette,
  Clock,
  HardDrive,
  FileImage,
} from 'lucide-react';
import { BACKGROUND_PRESETS } from '../data/sampleImages';
import { ProcessedImageResult } from '../types';
import {
  formatBytes,
  downloadBlob,
  compositeImageWithBackground,
  copyImageToClipboard,
} from '../utils/imageUtils';

interface ToolbarProps {
  result: ProcessedImageResult;
  selectedBackground: { id: string; type: 'transparent' | 'color'; value: string };
  onSelectBackground: (bg: { id: string; type: 'transparent' | 'color'; value: string }) => void;
  onReset: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  result,
  selectedBackground,
  onSelectBackground,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [isDownloadingCustom, setIsDownloadingCustom] = useState(false);
  const [customColor, setCustomColor] = useState('#6366f1');

  // Handle transparent PNG download
  const handleDownloadTransparent = () => {
    const filename = `cutout_${Date.now()}.png`;
    downloadBlob(result.resultBlob, filename);
  };

  // Handle custom background download
  const handleDownloadWithBackground = async () => {
    if (selectedBackground.type === 'transparent') {
      handleDownloadTransparent();
      return;
    }

    try {
      setIsDownloadingCustom(true);
      const compositeBlob = await compositeImageWithBackground(
        result.resultBlob,
        selectedBackground.value,
        result.originalWidth,
        result.originalHeight
      );
      const filename = `cutout_with_bg_${Date.now()}.png`;
      downloadBlob(compositeBlob, filename);
    } catch (err) {
      console.error('Failed to create composite image:', err);
    } finally {
      setIsDownloadingCustom(false);
    }
  };

  // Handle clipboard copy
  const handleCopyClipboard = async () => {
    let blobToCopy = result.resultBlob;
    if (selectedBackground.type === 'color') {
      try {
        blobToCopy = await compositeImageWithBackground(
          result.resultBlob,
          selectedBackground.value,
          result.originalWidth,
          result.originalHeight
        );
      } catch (e) {
        console.warn('Failed composite for clipboard copy, falling back to transparent:', e);
      }
    }

    const success = await copyImageToClipboard(blobToCopy);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('클립보드 복사에 실패했습니다. PNG 다운로드 버튼을 이용해주세요.');
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    onSelectBackground({
      id: 'custom',
      type: 'color',
      value: color,
    });
  };

  return (
    <div id="result-toolbar" className="w-full max-w-5xl mx-auto space-y-5 mt-6">
      {/* 1. Background Color Selector & Quick Presets Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#1E293B] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#F8FAFC]">
              배경 색상 변경 & 프리셋 합성
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#94A3B8]">
            단색 및 투명 배경을 즉시 선택하여 확인하고 다운로드하세요
          </span>
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap items-center gap-2">
          {BACKGROUND_PRESETS.map((preset) => {
            const isSelected = selectedBackground.id === preset.id;
            return (
              <button
                key={preset.id}
                id={`bg-preset-${preset.id}`}
                type="button"
                onClick={() => onSelectBackground(preset)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'border-indigo-600 dark:border-[#6366F1] bg-indigo-50 dark:bg-[#6366F1]/15 text-indigo-700 dark:text-[#818CF8]'
                    : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-[#94A3B8] hover:border-slate-300 dark:hover:border-white/[0.15]'
                }`}
              >
                {preset.type === 'transparent' ? (
                  <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/20 bg-checkered-light inline-block shrink-0" />
                ) : (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-white/20 inline-block shrink-0 shadow-inner"
                    style={{ backgroundColor: preset.value }}
                  />
                )}
                <span>{preset.name}</span>
              </button>
            );
          })}

          {/* Custom Color Picker Input */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="custom-bg-color"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                selectedBackground.id === 'custom'
                  ? 'border-indigo-600 dark:border-[#6366F1] bg-indigo-50 dark:bg-[#6366F1]/15 text-indigo-700 dark:text-[#818CF8]'
                  : 'border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-[#94A3B8] hover:border-slate-300 dark:hover:border-white/[0.15]'
              }`}
            >
              <input
                id="custom-bg-color"
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="w-3.5 h-3.5 p-0 border-0 rounded cursor-pointer"
              />
              <span>사용자 지정 색상</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Download & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Reset / Upload Another Image */}
        <button
          id="btn-reset-upload"
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.05] hover:bg-slate-100 dark:hover:bg-white/[0.1] text-slate-700 dark:text-[#F8FAFC] font-semibold text-xs transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>다른 이미지 업로드</span>
        </button>

        {/* Right: Copy & Downloads */}
        <div className="w-full sm:w-auto flex flex-wrap items-center gap-2.5">
          {/* Clipboard Copy */}
          <button
            id="btn-copy-clipboard"
            type="button"
            onClick={handleCopyClipboard}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.1] text-slate-800 dark:text-[#F8FAFC] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>클립보드 복사</span>
              </>
            )}
          </button>

          {/* Download with Background (Only visible if background is NOT transparent) */}
          {selectedBackground.type === 'color' && (
            <button
              id="btn-download-with-bg"
              type="button"
              onClick={handleDownloadWithBackground}
              disabled={isDownloadingCustom}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/15 hover:bg-indigo-100 dark:hover:bg-indigo-500/25 text-indigo-700 dark:text-[#818CF8] font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>배경 합성 PNG 저장</span>
            </button>
          )}

          {/* Main Primary Action: Download Transparent PNG */}
          <button
            id="btn-download-transparent-png"
            type="button"
            onClick={handleDownloadTransparent}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-semibold text-xs shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Download className="w-3.5 h-3.5" />
            <span>투명 PNG 다운로드</span>
          </button>
        </div>
      </div>

      {/* 3. Output Specs & Processing Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-xs">
          <FileImage className="w-4 h-4 text-indigo-500 shrink-0" />
          <div>
            <p className="text-slate-500 dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">해상도</p>
            <p className="font-semibold text-slate-800 dark:text-[#F8FAFC] text-[13px]">
              {result.originalWidth} × {result.originalHeight} px
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-xs">
          <HardDrive className="w-4 h-4 text-violet-500 shrink-0" />
          <div>
            <p className="text-slate-500 dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">원본 크기</p>
            <p className="font-semibold text-slate-800 dark:text-[#F8FAFC] text-[13px]">
              {formatBytes(result.originalSize)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-xs">
          <HardDrive className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <p className="text-slate-500 dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">PNG 크기</p>
            <p className="font-semibold text-slate-800 dark:text-[#F8FAFC] text-[13px]">
              {formatBytes(result.resultSize)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/[0.06] text-xs">
          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
          <div>
            <p className="text-slate-500 dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">소요 시간</p>
            <p className="font-semibold text-slate-800 dark:text-[#F8FAFC] text-[13px]">
              {(result.durationMs / 1000).toFixed(1)}s
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
