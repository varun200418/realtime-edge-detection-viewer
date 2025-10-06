import { useEffect, useRef } from 'react';

interface FrameViewerProps {
  imageUrl: string;
  width: number;
  height: number;
  className?: string;
}

export function FrameViewer({ imageUrl, width, height, className = '' }: FrameViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`border-2 border-gray-700 rounded-lg ${className}`}
    />
  );
}
