import FilterParams from "./FilterParams";

export default class Frame {
  constructor(file) {
    this.file = file;
    this.posX = 0;
    this.posY = 0;
    this.delay = 0;
    this.filter = new FilterParams();
    this.filterText = this.filter.toFilterText();
  }
}
