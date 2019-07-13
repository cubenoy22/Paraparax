export default class Frame {
  constructor(file) {
    this.file = file;
    this.posX = 0;
    this.posY = 0;
    this.brightness = 100;
    this.contrast = 100;
    this.grayscale = 0;
    this.hueRotate = 0;
    this.invert = false;
    this.saturate = 100;
    this.sepia = 0;
    this.blur = 0;
    this.filterText = '';
  }
}
