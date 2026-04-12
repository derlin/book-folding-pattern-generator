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
    this.initTutorialBanner();
  }

  private initTutorialBanner() {
    const banner = document.getElementById('tutorial-banner');
    const closeBtn = document.querySelector('.banner-close') as HTMLButtonElement;

    if (!banner || !closeBtn) return;

    // Check if user has dismissed the banner before
    const isDismissed = localStorage.getItem('tutorial-banner-dismissed') === 'true';

    if (isDismissed) {
      banner.classList.add('hidden');
    } else {
      // Show banner by default
      banner.classList.remove('hidden');
    }

    // Handle close button click
    closeBtn.addEventListener('click', () => {
      banner.classList.add('hidden');
      localStorage.setItem('tutorial-banner-dismissed', 'true');
    });
  }
}

new App();
