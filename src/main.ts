import './style.css';
import { Parameters } from './parameters';
import { UI } from './ui';
import { PixelLogic } from './pixel-logic';
import { Generator } from './generator';

class App {
  private parameters: Parameters;
  private pixelLogic: PixelLogic;
  private generator: Generator;

  constructor() {
    this.parameters = new Parameters();
    this.pixelLogic = new PixelLogic();
    this.generator = new Generator();
    new UI(this.parameters, this.pixelLogic, this.generator);
    this.init();
  }

  init() {
    console.log('App initialized');
  }
}

new App();