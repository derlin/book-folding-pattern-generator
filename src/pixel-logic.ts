export class PixelLogic {
  private sourceCanvas: HTMLCanvasElement;
  private sourceCtx: CanvasRenderingContext2D;

  constructor() {
    this.sourceCanvas = document.getElementById('source-canvas') as HTMLCanvasElement;
    const ctx = this.sourceCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2d context from source canvas');
    }
    this.sourceCtx = ctx;
  }

  public async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          this.sourceCanvas.width = img.width;
          this.sourceCanvas.height = img.height;
          this.sourceCtx.drawImage(img, 0, 0);
          resolve(img);
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  public processImage(
    image: HTMLImageElement,
    resize: number,
    transparentIsWhite: boolean,
    threshold: number,
  ): ImageData {
    const newWidth = Math.floor(image.width * (resize / 100));
    const newHeight = Math.floor(image.height * (resize / 100));

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(image, 0, 0, newWidth, newHeight);

    const imageData = tempCtx.getImageData(0, 0, newWidth, newHeight);
    const data = imageData.data;

    // Black and white
    for (let i = 0; i < data.length; i += 4) {
      const isTransparent = data[i + 3] === 0; // Fully transparent
      if (isTransparent) {
        data[i] = data[i + 1] = data[i + 2] = transparentIsWhite ? 255 : 0;
      } else {
        // Average the pixels and compares it with the input threshold (default to 128)
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        const color = avg > threshold ? 255 : 0;
        data[i] = data[i + 1] = data[i + 2] = color;
      }
    }

    this.sourceCanvas.width = newWidth;
    this.sourceCanvas.height = newHeight;
    this.sourceCtx.putImageData(imageData, 0, 0);

    return imageData;
  }

  public trim(imageData: ImageData): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const { data, width, height } = imageData;
    let minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if (data[i] === 0) {
          // black pixel
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
    };
  }
}
