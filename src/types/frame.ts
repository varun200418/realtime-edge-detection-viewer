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

export enum ProcessingMode {
  CANNY_EDGE = 'Canny Edge',
  GRAYSCALE = 'Grayscale',
  INVERT = 'Invert Colors',
  COLOR_CHANNEL = 'Color Channel'
}

export enum ColorChannel {
  RED = 0,
  GREEN = 1,
  BLUE = 2
}