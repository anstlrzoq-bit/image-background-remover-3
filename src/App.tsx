import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Dropzone } from './components/Dropzone';
import { ProcessingOverlay } from './components/ProcessingOverlay';
import { ComparisonViewer } from './components/ComparisonViewer';
import { Toolbar } from './components/Toolbar';
import { processImageBackground } from './utils/backgroundRemoval';
import { getImageDimensions } from './utils/imageUtils';
import { BACKGROUND_PRESETS } from './data/sampleImages';
import { ProcessProgress, ProcessedImageResult, ViewMode, SampleImage } from './types';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProcessProgress>({
    stage: 'idle',
    percent: 0,
    message: '',
  });

  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ProcessedImageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('slider');
  const [selectedBackground, setSelectedBackground] = useState<{
    id: string;
    type: 'transparent' | 'color';
    value: string;
  }>(BACKGROUND_PRESETS[0]);

  // Synchronize darkMode with document element class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Clean up object URLs when result changes or unmounts
  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
      if (result?.resultUrl) URL.revokeObjectURL(result.resultUrl);
    };
  }, [originalPreviewUrl, result]);

  // Handle image processing pipeline
  const processImageSource = useCallback(
    async (source: File | Blob, fileMeta?: { name?: string; size?: number }) => {
      setErrorMessage(null);
      setIsProcessing(true);

      const previewUrl = URL.createObjectURL(source);
      setOriginalPreviewUrl(previewUrl);

      const startTime = performance.now();

      try {
        // Measure dimensions
        const { width, height } = await getImageDimensions(source);
        const originalSize = fileMeta?.size || source.size || 0;

        // Run background removal model
        const resultBlob = await processImageBackground(source, {
          onProgress: (p) => setProgress(p),
        });

        const resultUrl = URL.createObjectURL(resultBlob);
        const durationMs = Math.round(performance.now() - startTime);

        setResult({
          originalFile: source instanceof File ? source : undefined,
          originalUrl: previewUrl,
          originalWidth: width,
          originalHeight: height,
          originalSize,
          resultBlob,
          resultUrl,
          resultSize: resultBlob.size,
          durationMs,
        });
      } catch (err) {
        console.error('Processing failed:', err);
        setErrorMessage(
          err instanceof Error
            ? `배경 제거 중 오류가 발생했습니다: ${err.message}`
            : '배경 제거 처리 중 예상치 못한 문제가 발생했습니다. 다시 시도해주세요.'
        );
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  // User uploaded a local file
  const handleFileSelect = (file: File) => {
    processImageSource(file, { name: file.name, size: file.size });
  };

  // User clicked a sample image
  const handleSampleSelect = async (sample: SampleImage) => {
    try {
      setIsProcessing(true);
      setErrorMessage(null);
      setProgress({
        stage: 'loading-model',
        percent: 5,
        message: '샘플 이미지 불러오는 중...',
      });

      const response = await fetch(sample.url, { mode: 'cors' });
      if (!response.ok) throw new Error('샘플 이미지를 다운로드하지 못했습니다.');
      const blob = await response.blob();
      await processImageSource(blob, { name: `${sample.id}.jpg`, size: blob.size });
    } catch (err) {
      setIsProcessing(false);
      setErrorMessage('샘플 이미지를 불러오는 데 실패했습니다. 파일 업로드를 이용해주세요.');
    }
  };

  // Reset to initial upload state
  const handleReset = () => {
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    if (result?.resultUrl) URL.revokeObjectURL(result.resultUrl);

    setResult(null);
    setOriginalPreviewUrl(null);
    setErrorMessage(null);
    setIsProcessing(false);
    setProgress({ stage: 'idle', percent: 0, message: '' });
    setSelectedBackground(BACKGROUND_PRESETS[0]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-200 selection:bg-[#6366F1] selection:text-white font-sans">
      {/* Top Navigation */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isProcessing={isProcessing}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="w-full max-w-2xl mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold">작업 실패</p>
              <p className="mt-1 text-xs opacity-90">{errorMessage}</p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>처음으로 돌아가기</span>
              </button>
            </div>
          </div>
        )}

        {/* 1. Idle State: Dropzone */}
        {!isProcessing && !result && (
          <Dropzone
            onFileSelect={handleFileSelect}
            onSampleSelect={handleSampleSelect}
            isLoading={isProcessing}
          />
        )}

        {/* 2. Processing State: Scanning Overlay */}
        {isProcessing && (
          <ProcessingOverlay
            progress={progress}
            originalPreviewUrl={originalPreviewUrl}
          />
        )}

        {/* 3. Result State: Comparison Viewer & Toolbar */}
        {!isProcessing && result && (
          <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in">
            <ComparisonViewer
              result={result}
              selectedBackground={selectedBackground}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
              darkMode={darkMode}
            />

            <Toolbar
              result={result}
              selectedBackground={selectedBackground}
              onSelectBackground={setSelectedBackground}
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-white/[0.08] py-4 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
        <p>
          모든 이미지 처리는 사용자의 로컬 브라우저(WebAssembly) 내에서 직접 수행되며, 서버에 사진이 저장되지 않습니다.
        </p>
      </footer>
    </div>
  );
}
