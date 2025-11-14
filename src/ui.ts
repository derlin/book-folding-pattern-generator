import { Parameters } from "./parameters";
import { PixelLogic } from "./pixel-logic";
import { Generator } from "./generator";

export class UI {
  private parameters: Parameters;
  private pixelLogic: PixelLogic;
  private generator: Generator;
  private form: HTMLFormElement;
  private imageUpload: HTMLInputElement;
  private exportUnit: HTMLSelectElement;
  private dpiRow: HTMLElement;
  private outputPlaceholder: HTMLElement;
  private patternCanvas: HTMLCanvasElement;
  private downloadBtn: HTMLButtonElement;
  private infoDisplay: HTMLElement;
  private imageData: ImageData | null = null;
  private trim: { x: number; y: number; width: number; height: number } | null =
    null;

  private fieldsets: HTMLElement[] = [];

  constructor(
    parameters: Parameters,
    pixelLogic: PixelLogic,
    generator: Generator,
  ) {
    this.parameters = parameters;
    this.pixelLogic = pixelLogic;
    this.generator = generator;
    this.form = document.getElementById("controls-form") as HTMLFormElement;
    this.imageUpload = document.getElementById(
      "image-upload",
    ) as HTMLInputElement;
    this.exportUnit = document.getElementById(
      "export-unit",
    ) as HTMLSelectElement;
    this.dpiRow = document.getElementById("dpi-row") as HTMLElement;
    this.outputPlaceholder = document.getElementById(
      "output-placeholder",
    ) as HTMLElement;
    this.patternCanvas = document.getElementById(
      "pattern-canvas",
    ) as HTMLCanvasElement;
    this.downloadBtn = document.getElementById(
      "download-btn",
    ) as HTMLButtonElement;
    this.infoDisplay = document.getElementById("info-display") as HTMLElement;

    this.fieldsets = Array.from(this.form.querySelectorAll("fieldset"));

    this.init();
  }

  private init() {
    this.exportUnit.addEventListener("change", () => this.toggleDpiInput());
    this.form.addEventListener("change", () => this.handleFormChange());
    this.imageUpload.addEventListener("change", (e) =>
      this.handleImageUpload(e),
    );
    this.downloadBtn.addEventListener("click", () => this.handleDownload());

    // Add click listeners to legends for toggling fieldsets
    this.fieldsets.forEach((fieldset) => {
      const legend = fieldset.querySelector("legend");
      if (legend) {
        legend.addEventListener("click", () => this.toggleFieldset(fieldset));
      }
    });

    // Set initial state: Source Image expanded, others collapsed
    this.fieldsets.forEach((fieldset) => {
      if (fieldset.id === "fieldset-source-image") {
        this.toggleFieldset(fieldset, true); // Expand Source Image
      } else {
        this.toggleFieldset(fieldset, false); // Collapse others
      }
    });
  }

  private toggleFieldset(fieldset: HTMLElement, expand?: boolean) {
    const content = fieldset.querySelector(".fieldset-content") as HTMLElement;
    if (!content) return;

    const isExpanded = fieldset.classList.contains("expanded");
    const shouldExpand = expand === undefined ? !isExpanded : expand;

    if (shouldExpand) {
      fieldset.classList.add("expanded");
      content.style.maxHeight = content.scrollHeight + "px"; // Set to actual height
    } else {
      fieldset.classList.remove("expanded");
      content.style.maxHeight = "0";
    }
  }

  private toggleDpiInput() {
    this.dpiRow.style.display =
      this.exportUnit.value === "cm" ? "block" : "none";

    // Force recalculation of maxHeight for the Export fieldset if it's expanded
    const exportFieldset = document.getElementById(
      "fieldset-export",
    ) as HTMLElement;
    if (exportFieldset && exportFieldset.classList.contains("expanded")) {
      this.toggleFieldset(exportFieldset, true);
    }
  }

  private handleFormChange() {
    if (this.parameters.parse()) {
      const params = this.parameters.get();
      if (params.sourceImage) {
        this.imageData = this.pixelLogic.processImage(
          params.sourceImage,
          params.resize,
          params.transparentIsWhite,
        );
        this.trim = this.pixelLogic.trim(this.imageData);
        const { lineCount, segmentsCount } = this.generator.generate(
          params,
          this.imageData,
          this.trim,
        );
        this.infoDisplay.innerHTML = `
          <div class="info-chip" title="Total number of vertical lines generated in the pattern.">
            <span class="chip-icon">📏</span>
            <span class="chip-value highlight">${lineCount}</span>
            <span class="chip-label">Lines</span>
          </div>
          <div class="info-chip" title="Estimated number of pages required for a 'Fold Only' project. Each line corresponds to two pages.">
            <span class="chip-icon">📄</span>
            <span class="chip-value highlight">${lineCount * 2}</span>
            <span class="chip-label">Pages (Fold Only)</span>
          </div>
          <div class="info-chip" title="Total number of individual folded segments in the pattern.">
            <span class="chip-icon">✂️</span>
            <span class="chip-value highlight">${segmentsCount}</span>
            <span class="chip-label">Segments</span>
          </div>
          <div class="info-chip" title="Estimated number of pages required for a 'Cut & Fold' project. Each segment corresponds to two pages.">
            <span class="chip-icon">📚</span>
            <span class="chip-value highlight">${segmentsCount * 2}</span>
            <span class="chip-label">Pages (Cut & Fold)</span>
          </div>
        `;
      }
    }
  }

  private async handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const image = await this.pixelLogic.loadImage(file);
      this.parameters.get().sourceImage = image;
      this.outputPlaceholder.style.display = "none";
      this.patternCanvas.style.display = "block";
      this.handleFormChange();

      // Collapse Source Image and expand Pattern Generation only
      this.fieldsets.forEach((fieldset) => {
        if (fieldset.id === "fieldset-source-image") {
          this.toggleFieldset(fieldset, false); // Collapse Source Image
        } else if (fieldset.id === "fieldset-pattern-generation") {
          this.toggleFieldset(fieldset, true); // Expand Pattern Generation
        }
      });
    }
  }

  private handleDownload() {
    if (this.imageData && this.trim) {
      this.generator.export(this.parameters.get());
    } else {
      alert("Please generate a pattern first.");
    }
  }
}
