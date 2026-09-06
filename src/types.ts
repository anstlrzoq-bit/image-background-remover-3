export type ViewMode = 'slider' | 'side-by-side' | 'toggle';

export type BackgroundPreset = {
  id: string;
  name: string;
  type: 'transparent' | 'color';
  value: string;
};

export interface ProcessProgress {
  stage: 'idle' | 'loading-model' | 'segmenting' | 'rendering' | 'complete' | 'error';
  percent: number;
  message: string;
  timeElapsedMs?: number;
}

export interface ProcessedImageResult {
  originalFile?: File;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  originalSize: number;
  resultBlob: Blob;
  resultUrl: string;
  resultSize: number;
  durationMs: number;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
  thumbnail: string;
}
