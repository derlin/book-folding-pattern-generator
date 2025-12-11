export interface AppParameters {
  // Source
  sourceImage: HTMLImageElement | null;
  resize: number;
  transparentIsWhite: boolean;
  threshold: number;

  // Generation
  stripesSpacing: number;

  // Output
  lineThickness: number;
  horizontalSpacing: number;
  padding: number;
  helperLines: boolean;

  // Export
  exportHeight: number | null;
  exportUnit: "px" | "cm";
  exportDpi: number;
}

export class Parameters {
  private params: AppParameters;

  // Form elements
  private imageResize: HTMLInputElement;
  private transparentIsWhiteInput: HTMLInputElement;
  private thresholdInput: HTMLInputElement;
  private stripesSpacing: HTMLInputElement;
  private lineThickness: HTMLInputElement;
  private horizontalSpacing: HTMLInputElement;
  private padding: HTMLInputElement;
  private helperLines: HTMLInputElement;
  private exportHeight: HTMLInputElement;
  private exportUnit: HTMLSelectElement;
  private exportDpi: HTMLInputElement;

  constructor() {
    this.params = this.defaults();
    this.imageResize = this._get<HTMLInputElement>("image-resize");
    this.transparentIsWhiteInput = this._get<HTMLInputElement>(
      "transparent-is-white",
    );
    this.thresholdInput = this._get<HTMLInputElement>("bw-threshold");
    this.stripesSpacing = this._get<HTMLInputElement>("stripes-spacing");
    this.lineThickness = this._get<HTMLInputElement>("line-thickness");
    this.horizontalSpacing = this._get<HTMLInputElement>("horizontal-stretch");
    this.padding = this._get<HTMLInputElement>("padding");
    this.helperLines = this._get<HTMLInputElement>("helper-lines");
    this.exportHeight = this._get<HTMLInputElement>("export-height");
    this.exportUnit = this._get<HTMLSelectElement>("export-unit");
    this.exportDpi = this._get<HTMLInputElement>("export-dpi");
    this.parse();
  }

  public get(): AppParameters {
    return this.params;
  }

  public defaults(): AppParameters {
    return {
      sourceImage: null,
      resize: 100,
      transparentIsWhite: true,
      threshold: 128,
      stripesSpacing: 8,
      lineThickness: 2,
      horizontalSpacing: 1,
      padding: 10,
      helperLines: true,
      exportHeight: null,
      exportUnit: "px",
      exportDpi: 300,
    };
  }

  public parse(): boolean {
    this.params.resize = this.imageResize.valueAsNumber;
    this.params.transparentIsWhite = this.transparentIsWhiteInput.checked;
    this.params.threshold = this.thresholdInput.valueAsNumber;
    this.params.stripesSpacing = this.stripesSpacing.valueAsNumber;
    this.params.lineThickness = this.lineThickness.valueAsNumber;
    this.params.horizontalSpacing = this.horizontalSpacing.valueAsNumber;
    this.params.padding = this.padding.valueAsNumber;
    this.params.helperLines = this.helperLines.checked;
    this.params.exportHeight = this.exportHeight.valueAsNumber || null;
    this.params.exportUnit = this.exportUnit.value as "px" | "cm";
    this.params.exportDpi = this.exportDpi.valueAsNumber;
    return this.validate();
  }

  public validate(): boolean {
    let valid = true;
    const validateInput = (
      input: HTMLInputElement,
      min: number,
      max: number,
    ) => {
      const value = input.valueAsNumber;
      if (isNaN(value) || value < min || value > max) {
        input.setCustomValidity(`Must be between ${min} and ${max}`);
        valid = false;
      } else {
        input.setCustomValidity("");
      }
    };

    validateInput(this.imageResize, 10, 500);
    validateInput(this.thresholdInput, 0, 255);
    validateInput(this.stripesSpacing, 1, 100);
    validateInput(this.lineThickness, 1, 10);
    validateInput(this.horizontalSpacing, 1, 10);
    validateInput(this.padding, 0, 100);
    if (this.exportHeight.value) {
      validateInput(this.exportHeight, 1, 10000);
    }
    if (this.exportDpi.value) {
      validateInput(this.exportDpi, 1, 1000);
    }

    return valid;
  }

  private _get<T extends HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
  }
}
