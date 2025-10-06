import { FrameData } from '../types/frame';

export class MockDataGenerator {
  private frameCounter = 0;

  generateMockFrame(isProcessed: boolean = false): FrameData {
    this.frameCounter++;

    const width = 640;
    const height = 480;
    const processingTime = Math.random() * 30 + 10;

    return {
      image: this.generatePlaceholderImage(width, height, isProcessed),
      timestamp: Date.now(),
      width,
      height,
      processingTime,
      isProcessed
    };
  }

  private generatePlaceholderImage(width: number, height: number, isProcessed: boolean): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    if (isProcessed) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;

      for (let i = 0; i < 50; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
      }

      ctx.strokeStyle = '#00FF00';
      ctx.lineWidth = 3;
      ctx.strokeRect(width * 0.3, height * 0.3, width * 0.4, height * 0.4);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, '#2563eb');
      gradient.addColorStop(0.5, '#3b82f6');
      gradient.addColorStop(1, '#60a5fa');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 10; i++) {
        ctx.fillRect(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 100 + 50,
          Math.random() * 100 + 50
        );
      }
    }

    ctx.fillStyle = isProcessed ? '#00FF00' : '#FFFFFF';
    ctx.font = '16px monospace';
    ctx.fillText(`Frame #${this.frameCounter}`, 10, 30);
    ctx.fillText(new Date().toLocaleTimeString(), 10, 50);

    return canvas.toDataURL();
  }
}
