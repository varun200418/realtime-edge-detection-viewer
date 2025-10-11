import { useState, useEffect, useCallback, useRef } from 'react';
import { FrameData, FrameStats, ViewMode, ProcessingMode, ColorChannel } from '../types/frame';
import { ImageProcessor } from '../utils/imageProcessor';

export function useCameraStream() {
  const [currentFrame, setCurrentFrame] = useState<FrameData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.RAW);
  const [processingMode, setProcessingMode] = useState<ProcessingMode>(ProcessingMode.CANNY_EDGE);
  const [colorChannel, setColorChannel] = useState<ColorChannel>(ColorChannel.RED);
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

    if (frameTimestamps.current.length > 30) frameTimestamps.current.shift();
    if (processingTimes.current.length > 30) processingTimes.current.shift();

    if (frameTimestamps.current.length >= 2) {
      const timeSpan = now - frameTimestamps.current[0];
      const fps = (frameTimestamps.current.length - 1) / (timeSpan / 1000);
      const avgProcTime = processingTimes.current.reduce((a, b) => a + b, 0) / processingTimes.current.length;

      setStats(prev => ({
        fps: fps || prev.fps,
        resolution: `${width}x${height}`,
        avgProcessingTime: avgProcTime,
        frameCount: prev.frameCount + 1
      }));
    } else {
      setStats(prev => ({ ...prev, resolution: `${width}x${height}`, frameCount: prev.frameCount + 1 }));
    }
  }, []);

  const applyProcessing = useCallback(async (imageUrl: string) => {
    switch (processingMode) {
      case ProcessingMode.CANNY_EDGE:
        return imageProcessor.current.applyCannyEdgeDetection(imageUrl);
      case ProcessingMode.GRAYSCALE:
        return imageProcessor.current.applyGrayscale(imageUrl);
      case ProcessingMode.INVERT:
        return imageProcessor.current.applyInvert(imageUrl);
      case ProcessingMode.COLOR_CHANNEL:
        return imageProcessor.current.applyColorChannel(imageUrl, colorChannel);
      default:
        return imageUrl;
    }
  }, [processingMode, colorChannel]);

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
        processedImage = await applyProcessing(imageData);
      } catch (error) {
        console.error('Processing error:', error);
      }
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    setCurrentFrame({
      image: processedImage,
      timestamp: Date.now(),
      width: canvas.width,
      height: canvas.height,
      processingTime,
      isProcessed: viewMode === ViewMode.PROCESSED
    });
    updateStats(processingTime, canvas.width, canvas.height);

    if (isStreaming) {
      animationFrameRef.current = requestAnimationFrame(captureFrameFromVideo);
    }
  }, [isStreaming, viewMode, updateStats, applyProcessing]);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
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
      await new Promise<void>(resolve => {
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
      setCameraError(error instanceof Error ? error.message : 'Failed to access camera.');
      setIsStreaming(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    setIsStreaming(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode(prev => (prev === ViewMode.RAW ? ViewMode.PROCESSED : ViewMode.RAW));
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

      let imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      if (viewMode === ViewMode.PROCESSED) {
        imageDataUrl = await applyProcessing(imageDataUrl);
      }

      const link = document.createElement('a');
      link.download = `capture-${Date.now()}.jpg`;
      link.href = imageDataUrl;
      link.click();
    }
  }, [viewMode, applyProcessing]);

  useEffect(() => {
    if (isStreaming) {
      animationFrameRef.current = requestAnimationFrame(captureFrameFromVideo);
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isStreaming, captureFrameFromVideo]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    currentFrame,
    viewMode,
    isStreaming,
    cameraError,
    stats,
    processingMode,
    colorChannel,
    startCamera,
    stopCamera,
    toggleViewMode,
    captureSnapshot,
    setProcessingMode,
    setColorChannel
  };
}