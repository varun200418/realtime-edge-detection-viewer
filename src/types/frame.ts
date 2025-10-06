export interface FrameData {
  image: string;
  timestamp: number;
  width: number;
  height: number;
  processingTime: number;
  isProcessed: boolean;
}

export interface FrameStats {
  fps: number;
  resolution: string;
  avgProcessingTime: number;
  frameCount: number;
}

export enum ViewMode {
  RAW = 'raw',
  PROCESSED = 'processed'
}
