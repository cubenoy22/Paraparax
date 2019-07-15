export default class FilterParams {
  constructor(
    blur = 0,
    brightness = 100,
    contrast = 100,
    grayscale = 0,
    hueRotate = 0,
    invert = 0,
    opacity = 100,
    saturate = 100,
    sepia = 0,
  ) {
    this.blur = blur;
    this.brightness = brightness;
    this.contrast = contrast;
    this.grayscale = grayscale;
    this.hueRotate = hueRotate;
    this.invert = invert;
    this.opacity = opacity;
    this.saturate = saturate;
    this.sepia = sepia;
  }

  toFilterText() {
    const { blur, brightness, contrast, grayscale, hueRotate, invert, opacity, saturate, sepia } = this;
    return `blur(${blur}px) brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg) invert(${invert}%) opacity(${opacity}%) saturate(${saturate}%) sepia(${sepia}%)`;
  }
}
