import { ColorChannel } from '../types/frame';

export class ImageProcessor {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageCache: { [key: string]: string } = {};

  constructor() {
    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    this.ctx = context;
  }

  private async loadImage(imageUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  private processImageData(
    img: HTMLImageElement,
    processor: (data: Uint8ClampedArray, width: number, height: number) => Uint8ClampedArray | void
  ): string {
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const processedData = processor(imageData.data, imageData.width, imageData.height);

    if (processedData) {
      this.ctx.putImageData(new ImageData(processedData, this.canvas.width, this.canvas.height), 0, 0);
    } else {
      this.ctx.putImageData(imageData, 0, 0);
    }

    return this.canvas.toDataURL();
  }

  private async applyEffect(
    effectName: string,
    imageUrl: string,
    processor: (data: Uint8ClampedArray, width: number, height: number) => Uint8ClampedArray | void
  ): Promise<string> {
    const cacheKey = `${effectName}-${imageUrl}`;
    if (this.imageCache[cacheKey]) {
      return this.imageCache[cacheKey];
    }

    const img = await this.loadImage(imageUrl);
    const result = this.processImageData(img, processor);
    this.imageCache[cacheKey] = result;
    return result;
  }

  async applyCannyEdgeDetection(imageUrl: string): Promise<string> {
    return this.applyEffect('canny', imageUrl, (data, width, height) => {
      const grayscale = new Uint8ClampedArray(width * height);
      for (let i = 0; i < data.length; i += 4) {
        grayscale[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
      const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
      const edges = new Uint8ClampedArray(width * height);

      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let gx = 0;
          let gy = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              gx += grayscale[(y + ky) * width + (x + kx)] * sobelX[ky + 1][kx + 1];
              gy += grayscale[(y + ky) * width + (x + kx)] * sobelY[ky + 1][kx + 1];
            }
          }
          edges[y * width + x] = Math.sqrt(gx * gx + gy * gy) > 50 ? 255 : 0;
        }
      }

      const outputData = new Uint8ClampedArray(data.length);
      for (let i = 0; i < edges.length; i++) {
        outputData[i * 4] = edges[i];
        outputData[i * 4 + 1] = edges[i];
        outputData[i * 4 + 2] = edges[i];
        outputData[i * 4 + 3] = 255;
      }
      return outputData;
    });
  }

  async applyGrayscale(imageUrl: string): Promise<string> {
    return this.applyEffect('grayscale', imageUrl, data => {
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
    });
  }

  async applyInvert(imageUrl: string): Promise<string> {
    return this.applyEffect('invert', imageUrl, data => {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
    });
  }

  async applyColorChannel(imageUrl: string, channel: ColorChannel): Promise<string> {
    return this.applyEffect(`channel-${channel}`, imageUrl, data => {
      for (let i = 0; i < data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
          if (j !== channel) {
            data[i + j] = 0;
          }
        }
      }
    });
  }
}