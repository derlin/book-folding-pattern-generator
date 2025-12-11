import type { AppParameters } from './parameters';

export class Generator {
  private patternCanvas: HTMLCanvasElement;
  private patternCtx: CanvasRenderingContext2D;

  constructor() {
    this.patternCanvas = document.getElementById('pattern-canvas') as HTMLCanvasElement;
    const ctx = this.patternCanvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2d context from pattern canvas');
    }
    this.patternCtx = ctx;
  }

  public generate(
    params: AppParameters,
    imageData: ImageData,
    trim: { x: number; y: number; width: number; height: number },
  ): { lineCount: number; segmentsCount: number } {
    const { stripesSpacing, lineThickness, horizontalSpacing, padding, helperLines } = params;
    const { data, width } = imageData;

    this.patternCanvas.width = trim.width * horizontalSpacing + padding * 2;
    this.patternCanvas.height = trim.height + padding * 2;

    this.patternCtx.fillStyle = 'white';
    this.patternCtx.fillRect(0, 0, this.patternCanvas.width, this.patternCanvas.height);

    let lineCount = 0;
    let segmentsCount = 0;
    for (let x = trim.x; x < trim.x + trim.width; x += stripesSpacing) {
      const newX = (x - trim.x) * horizontalSpacing + padding;

      if (helperLines) {
        this.patternCtx.beginPath();
        this.patternCtx.moveTo(newX, 0);
        this.patternCtx.lineTo(newX, this.patternCanvas.height);
        this.patternCtx.lineWidth = 1;
        this.patternCtx.strokeStyle =
          lineCount % 10 === 0 ? 'red' : lineCount % 2 === 0 ? 'gray' : 'transparent';
        this.patternCtx.stroke();
      }

      let startY = -1;
      const segments = [];
      for (let y = trim.y; y < trim.y + trim.height; y++) {
        const i = (y * width + x) * 4;
        const isDark = data[i] === 0;

        if (isDark) {
          if (startY === -1) {
            startY = y;
          }
        } else {
          if (startY !== -1) {
            segments.push({ start: startY, end: y - 1 });
            startY = -1;
          }
        }
      }
      if (startY !== -1) {
        segments.push({ start: startY, end: trim.y + trim.height - 1 });
      }

      this.patternCtx.lineWidth = lineThickness;
      this.patternCtx.strokeStyle = 'black';
      segments.forEach((seg) => {
        this.patternCtx.beginPath();
        this.patternCtx.moveTo(newX, seg.start - trim.y + padding);
        this.patternCtx.lineTo(newX, seg.end - trim.y + padding + 1);
        this.patternCtx.stroke();
        segmentsCount++;
      });

      lineCount++;
    }
    return { lineCount, segmentsCount };
  }

  public export(params: AppParameters) {
    const { exportHeight, exportUnit, exportDpi } = params;

    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d')!;

    const originalWidth = this.patternCanvas.width;
    const originalHeight = this.patternCanvas.height;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    if (exportHeight) {
      if (exportUnit === 'cm') {
        newHeight = (exportHeight / 2.54) * exportDpi;
      } else {
        newHeight = exportHeight;
      }
      newWidth = (originalWidth / originalHeight) * newHeight;
    }

    exportCanvas.width = newWidth;
    exportCanvas.height = newHeight;

    exportCtx.fillStyle = 'white';
    exportCtx.fillRect(0, 0, newWidth, newHeight);
    exportCtx.drawImage(this.patternCanvas, 0, 0, newWidth, newHeight);

    const dataURL = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'book-folding-pattern.png';
    link.click();
  }
}
