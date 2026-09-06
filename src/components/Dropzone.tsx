import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, ClipboardPaste, ArrowUpRight, Sparkles } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/sampleImages';
import { SampleImage } from '../types';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onSampleSelect: (sample: SampleImage) => void;
  isLoading: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  onSampleSelect,
  isLoading,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global paste handler (Ctrl+V / Cmd+V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isLoading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            handleValidFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isLoading]);

  const handleValidFile = (file: File) => {
    setErrorMessage(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/avif'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('지원되지 않는 파일 형식입니다. JPG, PNG, WEBP 이미지를 업로드해주세요.');
      return;
    }

    // Maximum file size check (e.g. 25MB)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('이미지 용량이 너무 큽니다. 25MB 이하의 이미지를 사용해주세요.');
      return;
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (isLoading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleValidFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleValidFile(file);
      // Reset input value so same file can be selected again
      e.target.value = '';
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>브라우저 내 WebAssembly 초고속 AI 배경 누끼 따기</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
          사진 속 배경을 단 몇 초 만에 깔끔하게 제거하세요
        </h2>
        <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          서버에 사진을 전송하지 않아 소중한 개인정보가 100% 안전하게 보호됩니다.
          드래그하거나 클립보드(Ctrl+V) 이미지를 바로 붙여넣어보세요.
        </p>
      </div>

      {/* Main Drag & Drop Zone Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#1E293B] p-6 sm:p-8 shadow-sm">
        <div
          id="dropzone-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isLoading && fileInputRef.current?.click()}
          className={`relative group cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[280px] ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/[0.08] scale-[1.005]'
              : 'border-slate-300 dark:border-white/[0.12] hover:border-indigo-500 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-white/[0.02] hover:bg-indigo-50/30 dark:hover:bg-indigo-500/[0.04]'
          }`}
        >
          <input
            id="file-upload-input"
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
            onChange={handleInputChange}
            disabled={isLoading}
          />

          {/* Upload Icon Container */}
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-transform duration-200 ${
              isDragOver
                ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 group-hover:scale-105'
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          {/* Upload Directives */}
          <div className="space-y-1.5 mb-4">
            <p className="text-base sm:text-lg font-semibold text-slate-900 dark:text-[#F8FAFC]">
              <span className="text-indigo-600 dark:text-[#818CF8] hover:underline underline-offset-4">
                이미지 파일 선택
              </span>
              {' '}또는 파일을 여기로 드래그하세요
            </p>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              PNG, JPG, WEBP 지원 (최대 25MB)
            </p>
          </div>

          {/* Action Button & Clipboard hint */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
              <ClipboardPaste className="w-3.5 h-3.5 text-indigo-500" />
              <span>클립보드 이미지 붙여넣기 (Ctrl + V)</span>
            </span>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="mt-4 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* Sample Images Quick Trial Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-[#94A3B8]">
              샘플 이미지로 바로 테스트
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#94A3B8]">클릭 즉시 실행</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              id={`sample-btn-${sample.id}`}
              type="button"
              disabled={isLoading}
              onClick={() => onSampleSelect(sample)}
              className="group relative flex flex-col items-start overflow-hidden rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#1E293B] p-2 text-left transition-all hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-900">
                <img
                  src={sample.thumbnail}
                  alt={sample.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  crossOrigin="anonymous"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 border border-white/20">
                    테스트 <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
              <div className="mt-2 w-full px-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] truncate">
                  {sample.title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  {sample.category}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
