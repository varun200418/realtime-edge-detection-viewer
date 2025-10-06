import { useState, useEffect, useCallback, useRef } from 'react';
import { FrameData, FrameStats, ViewMode } from '../types/frame';
import { ImageProcessor } from '../utils/imageProcessor';

export function useCameraStream() {
  const [currentFrame, setCurrentFrame] = useState<FrameData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.RAW);
  const [isStreaming, setIsStreaming] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stats, setStats] = useState<FrameStats>({
    fps: 0,
    resolution: '0x0',
    avgProcessingTime: 0,
    frameCount: 0
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const imageProcessor = useRef(new ImageProcessor());

  const frameTimestamps = useRef<number[]>([]);
  const processingTimes = useRef<number[]>([]);

  const updateStats = useCallback((processingTime: number, width: number, height: number) => {
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
        fps: fps || prev.fps,
        resolution: `${width}x${height}`,
        avgProcessingTime: avgProcTime,
        frameCount: prev.frameCount + 1
      }));
    } else {
      setStats(prev => ({
        ...prev,
        resolution: `${width}x${height}`,
        frameCount: prev.frameCount + 1
      }));
    }
  }, []);

  const captureFrameFromVideo = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== video.HAVE_ENOUGH_DATA) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const startTime = performance.now();
    const imageData = canvas.toDataURL('image/jpeg', 0.8);

    let processedImage = imageData;

    if (viewMode === ViewMode.PROCESSED) {
      try {
        processedImage = await imageProcessor.current.applyCannyEdgeDetection(imageData);
      } catch (error) {
        console.error('Processing error:', error);
      }
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    const frameData: FrameData = {
      image: processedImage,
      timestamp: Date.now(),
      width: canvas.width,
      height: canvas.height,
      processingTime,
      isProcessed: viewMode === ViewMode.PROCESSED
    };

    setCurrentFrame(frameData);
    updateStats(processingTime, canvas.width, canvas.height);

    if (isStreaming) {
      animationFrameRef.current = requestAnimationFrame(captureFrameFromVideo);
    }
  }, [isStreaming, viewMode, updateStats]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      if (!videoRef.current) {
        videoRef.current = document.createElement('video');
        videoRef.current.playsInline = true;
        videoRef.current.autoplay = true;
      }

      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas');
      }

      videoRef.current.srcObject = stream;

      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            resolve();
          };
        }
      });

      setIsStreaming(true);
      setStats(prev => ({ ...prev, frameCount: 0 }));
      frameTimestamps.current = [];
      processingTimes.current = [];

    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(
        error instanceof Error
          ? error.message
          : 'Failed to access camera. Please ensure you have granted camera permissions.'
      );
      setIsStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    setIsStreaming(false);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === ViewMode.RAW ? ViewMode.PROCESSED : ViewMode.RAW);
  }, []);

  const captureSnapshot = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = canvas.toDataURL('image/jpeg', 0.95);

      const link = document.createElement('a');
      link.download = `capture-${Date.now()}.jpg`;
      link.href = imageData;
      link.click();
    }
  }, []);

  useEffect(() => {
    if (isStreaming) {
      captureFrameFromVideo();
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isStreaming, captureFrameFromVideo]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    currentFrame,
    viewMode,
    isStreaming,
    cameraError,
    stats,
    startCamera,
    stopCamera,
    toggleViewMode,
    captureSnapshot
  };
}
