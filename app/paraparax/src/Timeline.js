import FilterParams from "./FilterParams";

export default class Timeline {
  constructor(frames, parsedJson) {
    this.frames = frames;
    if (parsedJson) {
      const { positions, delays, filters } = parsedJson;
      let prevItem;
      if (positions) {
        const positionItems = positions.map(aData => {
          const item = new PositionItem(aData.index, frames, undefined, prevItem, aData.x, aData.y);
          if (prevItem) {
            prevItem.nextItem = item;
          }
          prevItem = item;
          return item;
        });
        this.firstPosition = positionItems[0];
      }
      if (delays) {
        prevItem = undefined;
        const delayItems = delays.map(aData => {
          const item = new DelayItem(aData.index, frames, undefined, prevItem, aData.delay);
          if (prevItem) {
            prevItem.nextItem = item;
          }
          prevItem = item;
          return item;
        });
        this.firstDelay = delayItems[0];
      }
      if (filters) {
        prevItem = undefined;
        const filterItems = filters.map(aData => {
          const item = new FilterItem(aData.index, frames, undefined, prevItem, Object.assign(new FilterParams(), aData.params));
          if (prevItem) {
            prevItem.nextItem = item;
          }
          prevItem = item;
          return item;
        });
        this.firstFilter = filterItems[0];
      }
    }

    if (!this.firstPosition) {
      this.firstPosition = new PositionItem(0, frames);
    }
    if (!this.firstDelay) {
      this.firstDelay = new DelayItem(0, frames, undefined, undefined, 1000 / 30);
    }
    if (!this.firstFilter) {
      this.firstFilter = new FilterItem(0, frames);
    }

    this.applyPositionsToFrames();
    this.applyDelaysToFrames();
    this.applyFiltersToFrames();
  }

  // Common

  hasItemAt(index, firstItem) {
    if (index === 0) {
      return true;
    }

    let pos = firstItem.nextItem;
    while (pos) {
      if (pos.index === index) {
        return true;
      } else if (pos.index < index) {
        pos = pos.nextItem;
      } else if (pos.index > index) {
        return false;
      }
    }
    return false;
  }

  getItemFor(index, firstItem, constructor) {
    let item = firstItem;
    if (index === 0) {
      return item;
    }
    let prevItem = item;
    item = item.nextItem;
    while (item) {
      if (item.index === index) {
        return item;
      } else if (item.index < index) {
        prevItem = item;
        item = item.nextItem;
      } else if (item.index > index) {
        const result = constructor(index, this.frames, item, prevItem);
        prevItem.nextItem = result;
        item.prevItem = result;
        return result;
      }
    }
    const result = constructor(index, this.frames, undefined, prevItem);
    prevItem.nextItem = result;
    return result;
  }

  deleteItemAt(index, firstItem, applyToFrames) {
    if (index > 0) {
      let item = firstItem.nextItem;
      while (item) {
        if (item.index === index) {
          const nextItem = item.nextItem;
          item.prevItem.nextItem = nextItem;
          if (nextItem) {
            nextItem.prevItem = item.prevItem;
          }
          applyToFrames();
          return;
        }
        item = item.nextItem;
      }
    } else {
      const item = firstItem;
      item.reset();
      applyToFrames();
    }
  }

  toJSON() {
    const positions = [];
    const delays = [];
    const filters = [];
    let pos = this.firstPosition;
    while (pos) {
      positions.push(pos.toJSON());
      pos = pos.nextItem;
    }
    let delay = this.firstDelay;
    while (delay) {
      delays.push(delay.toJSON());
      delay = delay.nextItem;
    }
    let filter = this.firstFilter;
    while (filter) {
      filters.push(filter.toJSON());
      filter = filter.nextItem;
    }
    return {
      positions,
      delays,
      filters
    };
  }

  // Position

  applyPositionsToFrames() {
    let item = this.firstPosition;
    while (item) {
      this.setPositionAt(item.index, item.x, item.y);
      item = item.nextItem;
    }
  }

  hasPositionAt(index) {
    return this.hasItemAt(index, this.firstPosition);
  }

  getPositionFor(index) {
    return this.getItemFor(
      index,
      this.firstPosition,
      (index, frames, pos, prevPos) => new PositionItem(index, frames, pos, prevPos)
    );
  }

  setPositionAt(index, x, y) {
    const pos = this.getPositionFor(index);
    pos.x = x;
    pos.y = y;

    if (pos.prevItem) {
      const startX = pos.prevItem.x;
      const startY = pos.prevItem.y;
      const { startIndex } = pos;
      const diffX = (x - startX) / (index - startIndex);
      const diffY = (y - startY) / (index - startIndex);
      for (let i = startIndex; i <= index; ++i) {
        this.frames[i].posX = startX + diffX * (i - startIndex);
        this.frames[i].posY = startY + diffY * (i - startIndex);
      }
    } else {
      this.frames[0].posX = x;
      this.frames[0].posY = y;
    }
    if (pos.nextItem) {
      const endIndex = pos.nextItem.index;
      const endX = pos.nextItem.x;
      const endY = pos.nextItem.y;
      const diffX = (endX - pos.x) / (endIndex - index);
      const diffY = (endY - pos.y) / (endIndex - index);
      for (let i = index; i <= endIndex; ++i) {
        this.frames[i].posX = pos.x + diffX * (i - index);
        this.frames[i].posY = pos.y + diffY * (i - index);
      }
    } else {
      for (let i = index; i <= pos.endIndex; ++i) {
        this.frames[i].posX = pos.x;
        this.frames[i].posY = pos.y;
      }
    }
  }

  deletePositionAt(index) {
    this.deleteItemAt(index, this.firstPosition, this.applyPositionsToFrames.bind(this));
  }

  // Delay

  applyDelaysToFrames() {
    let item = this.firstDelay;
    while (item) {
      this.setDelayAt(item.index, item.delay);
      item = item.nextItem;
    }
  }

  hasDelayAt(index) {
    return this.hasItemAt(index, this.firstDelay);
  }

  getDelayFor(index) {
    return this.getItemFor(
      index,
      this.firstDelay,
      (index, frames, pos, prevPos) => new DelayItem(index, frames, pos, prevPos)
    );
  }

  setDelayAt(index, delay) {
    const pos = this.getDelayFor(index);
    pos.delay = delay;

    const { endIndex } = pos;
    for (let i = index; i <= endIndex; ++i) {
      this.frames[i].delay = delay;
    }
  }

  deleteDelayAt(index) {
    this.deleteItemAt(index, this.firstDelay, this.applyDelaysToFrames.bind(this));
  }

  // Filter

  applyFiltersToFrames() {
    let item = this.firstFilter;
    while (item) {
      this.setFilterAt(item.index, item.params);
      item = item.nextItem;
    }
  }

  hasFilterAt(index) {
    return this.hasItemAt(index, this.firstFilter);
  }

  getFilterFor(index) {
    return this.getItemFor(
      index,
      this.firstFilter,
      (index, frames, pos, prevPos) => new FilterItem(index, frames, pos, prevPos)
    );
  }

  setFilterAt(index, params) {
    const pos = this.getFilterFor(index);
    pos.params = params;

    if (pos.prevItem) {
      const { startIndex } = pos;
      const prevParams = pos.prevItem.params;
      for (let i = index; i >= startIndex; --i) {
        const tempParams = new FilterParams();
        for (let key of Object.keys(params)) {
          const startValue = prevParams[key];
          const diff = (params[key] - startValue) / (index - startIndex);
          tempParams[key] = startValue + diff * (i - startIndex);
        }
        this.frames[i].filter = tempParams;
        this.frames[i].filterText = tempParams.toFilterText();
      }
    } else {
      this.frames[index].filter = Object.assign(new FilterParams(), params);
      this.frames[index].filterText = params.toFilterText();
    }
    if (pos.nextItem) {
      const { endIndex } = pos;
      for (let i = endIndex; i >= index; --i) {
        const tempParams = new FilterParams();
        for (let key of Object.keys(params)) {
          const endValue = pos.nextItem.params[key];
          const diff = (endValue - pos.params[key]) / (endIndex > index ? endIndex - index : 1);
          tempParams[key] = pos.params[key] + diff * (i - index);
        }
        this.frames[i].filter = tempParams;
        this.frames[i].filterText = tempParams.toFilterText();
      }
    } else {
      for (let i = index; i <= pos.endIndex; ++i) {
        this.frames[i].filter = Object.assign(new FilterParams(), params);
        this.frames[i].filterText = params.toFilterText();
      }
    }
  }

  deleteFilterAt(index) {
    this.deleteItemAt(index, this.firstFilter, this.applyFiltersToFrames.bind(this));
  }

}

class TimelineItem {
  constructor(index, frames, nextItem, prevItem) {
    this.index = index;
    this.frames = frames;
    this.nextItem = nextItem;
    this.prevItem = prevItem;
  }

  get startIndex() {
    return this.prevItem ? this.prevItem.index : 0;
  }

  get endIndex() {
    return (this.nextItem ? this.nextItem.index : this.frames.length) - 1;
  }
}

class PositionItem extends TimelineItem {
  constructor(index, frames, nextItem, prevItem, x = 0, y = 0) {
    super(index, frames, nextItem, prevItem);
    this.x = x;
    this.y = y;
  }

  reset() {
    this.x = this.y = 0;
  }

  toJSON() {
    const { index, x, y } = this;
    return {
      index,
      x,
      y
    };
  }
}

class DelayItem extends TimelineItem {
  constructor(index, frames, nextItem, prevItem, delay) {
    super(index, frames, nextItem, prevItem);
    this.delay = delay;
  }

  reset() {
    this.delay = 1000 / 30;
  }

  toJSON() {
    const { index, delay } = this;
    return {
      index,
      delay
    };
  }
}

class FilterItem extends TimelineItem {
  constructor(index, frames, nextItem, prevItem, params = new FilterParams()) {
    super(index, frames, nextItem, prevItem);
    this.params = params;
  }

  reset() {
    this.params = new FilterParams();
  }

  toJSON() {
    const { index, params } = this;
    return {
      index,
      params
    };
  }
}
