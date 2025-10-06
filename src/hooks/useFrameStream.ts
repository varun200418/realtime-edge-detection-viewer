import { useState, useEffect, useCallback, useRef } from 'react';
import { FrameData, FrameStats, ViewMode } from '../types/frame';
import { MockDataGenerator } from '../utils/mockDataGenerator';
import { ImageProcessor } from '../utils/imageProcessor';

export function useFrameStream() {
  const [currentFrame, setCurrentFrame] = useState<FrameData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.RAW);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stats, setStats] = useState<FrameStats>({
    fps: 0,
    resolution: '640x480',
    avgProcessingTime: 0,
    frameCount: 0
  });

  const mockGenerator = useRef(new MockDataGenerator());
  const imageProcessor = useRef(new ImageProcessor());
  const frameTimestamps = useRef<number[]>([]);
  const processingTimes = useRef<number[]>([]);
  const streamInterval = useRef<number | null>(null);

  const updateStats = useCallback((processingTime: number) => {
    const now = Date.now();
    frameTimestamps.current.push(now);
    processingTimes.current.push(processingTime);

    if (frameTimestamps.current.length > 30) {
      frameTimestamps.current.shift();
    }
    if (processingTimes.current.length > 30) {
      processingTimes.current.shift();
    }

    if (frameTimestamps.current.length >= 2) {
      const timeSpan = frameTimestamps.current[frameTimestamps.current.length - 1] - frameTimestamps.current[0];
      const fps = (frameTimestamps.current.length - 1) / (timeSpan / 1000);

      const avgProcTime = processingTimes.current.reduce((a, b) => a + b, 0) / processingTimes.current.length;

      setStats(prev => ({
        ...prev,
        fps: fps || prev.fps,
        avgProcessingTime: avgProcTime,
        frameCount: prev.frameCount + 1
      }));
    }
  }, []);

  const processFrame = useCallback(async (sourceFrame: FrameData) => {
    const startTime = performance.now();

    try {
      const processedImage = await imageProcessor.current.applyCannyEdgeDetection(sourceFrame.image);
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      const processedFrame: FrameData = {
        ...sourceFrame,
        image: processedImage,
        isProcessed: true,
        processingTime
      };

      return processedFrame;
    } catch (error) {
      console.error('Frame processing error:', error);
      return sourceFrame;
    }
  }, []);

  const captureAndDisplayFrame = useCallback(async () => {
    const rawFrame = mockGenerator.current.generateMockFrame(false);

    if (viewMode === ViewMode.RAW) {
      setCurrentFrame(rawFrame);
      updateStats(rawFrame.processingTime);
    } else {
      const processedFrame = await processFrame(rawFrame);
      setCurrentFrame(processedFrame);
      updateStats(processedFrame.processingTime);
    }
  }, [viewMode, processFrame, updateStats]);

  const startStream = useCallback(() => {
    setIsStreaming(true);
    setStats(prev => ({ ...prev, frameCount: 0 }));
    frameTimestamps.current = [];
    processingTimes.current = [];
  }, []);

  const stopStream = useCallback(() => {
    setIsStreaming(false);
    if (streamInterval.current !== null) {
      clearInterval(streamInterval.current);
      streamInterval.current = null;
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === ViewMode.RAW ? ViewMode.PROCESSED : ViewMode.RAW);
  }, []);

  useEffect(() => {
    if (isStreaming) {
      captureAndDisplayFrame();

      streamInterval.current = window.setInterval(() => {
        captureAndDisplayFrame();
      }, 66);

      return () => {
        if (streamInterval.current !== null) {
          clearInterval(streamInterval.current);
        }
      };
    }
  }, [isStreaming, captureAndDisplayFrame]);

  return {
    currentFrame,
    viewMode,
    isStreaming,
    stats,
    startStream,
    stopStream,
    toggleViewMode,
    captureAndDisplayFrame
  };
}
