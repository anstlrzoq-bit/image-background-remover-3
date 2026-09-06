import { removeBackground, Config } from '@imgly/background-removal';
import { ProcessProgress } from '../types';

export interface RemoveBackgroundOptions {
  onProgress?: (progress: ProcessProgress) => void;
  model?: 'isnet_quint8' | 'isnet_fp16' | 'isnet';
}

/**
 * Executes browser-side AI background removal using WebAssembly & ONNX runtime.
 */
export async function processImageBackground(
  imageSource: Blob | File | string,
  options?: RemoveBackgroundOptions
): Promise<Blob> {
  const startTime = performance.now();
  const onProgress = options?.onProgress;

  onProgress?.({
    stage: 'loading-model',
    percent: 10,
    message: 'AI 모델 및 WebAssembly 엔진 준비 중...',
  });

  const config: Config = {
    // isnet_quint8 is highly optimized for browser client, ~40MB, rapid WASM inference
    model: options?.model || 'isnet_quint8',
    progress: (key: string, current: number, total: number) => {
      let percent = 15;
      if (total > 0) {
        percent = Math.min(95, Math.max(10, Math.round((current / total) * 100)));
      }

      const elapsed = Math.round(performance.now() - startTime);

      let stage: ProcessProgress['stage'] = 'loading-model';
      let message = 'AI 모델을 로드하는 중...';

      if (key.includes('compute') || key.includes('inference')) {
        stage = 'segmenting';
        message = '피사체 경계선 및 배경 정밀 분석 중...';
      } else if (key.includes('fetch')) {
        stage = 'loading-model';
        message = `신경망 모델 다운로드 중 (${percent}%)...`;
      } else if (key.includes('render') || key.includes('apply')) {
        stage = 'rendering';
        message = '투명 알파 마스크 합성 중...';
      }

      onProgress?.({
        stage,
        percent,
        message,
        timeElapsedMs: elapsed,
      });
    },
    debug: false,
  };

  try {
    const resultBlob = await removeBackground(imageSource, config);

    onProgress?.({
      stage: 'complete',
      percent: 100,
      message: '배경 제거 완료!',
      timeElapsedMs: Math.round(performance.now() - startTime),
    });

    return resultBlob;
  } catch (error) {
    console.error('Error during client-side background removal:', error);
    onProgress?.({
      stage: 'error',
      percent: 0,
      message: error instanceof Error ? error.message : '배경 제거 중 오류가 발생했습니다.',
    });
    throw error;
  }
}
