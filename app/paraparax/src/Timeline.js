export default class Timeline {
  constructor(frames, json) {
    this.frames = frames;
    if (json) {
      let prevItem;
      const items = json.positions.map(aData => {
        const item = new PositionItem(aData.index, frames, undefined, prevItem, aData.x, aData.y);
        if (prevItem) {
          prevItem.nextItem = item;
        }
        prevItem = item;
        return item;
      });
      this.firstPosition = items[0];
      items.forEach(item => {
        this.setPositionAt(item.index, item.x, item.y);
      });
    } else {
      this.firstPosition = new PositionItem(0, frames);
    }
  }

  hasPositionAt(index) {
    if (index === 0) {
      return true;
    }

    let pos = this.firstPosition.nextItem;
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

  getPositionFor(index) {
    let pos = this.firstPosition;
    if (index === 0) {
      return pos;
    }
    let prevPos = pos;
    pos = pos.nextItem;
    while (pos) {
      if (pos.index === index) {
        return pos;
      } else if (pos.index < index) {
        prevPos = pos;
        pos = pos.nextItem;
      } else if (pos.index > index) {
        const result = new PositionItem(index, this.frames, pos, prevPos);
        prevPos.nextItem = result;
        pos.prevItem = result;
        return result;
      }
    }
    const result = new PositionItem(index, this.frames, undefined, prevPos);
    prevPos.nextItem = result;
    return result;
  }

  setPositionAt(index, x, y) {
    const pos = this.getPositionFor(index);
    pos.x = x;
    pos.y = y;

    if (index > 0) {
      const startX = pos.prevItem.x;
      const startY = pos.prevItem.y;
      const { startIndex } = pos;
      const diffX = (pos.x - startX) / (index - startIndex);
      const diffY = (pos.y - startY) / (index - startIndex);
      for (let i = startIndex; i <= index; ++i) {
        this.frames[i].posX = startX + diffX * (i - startIndex);
        this.frames[i].posY = startY + diffY * (i - startIndex);
      }
    } else {
      this.frames[0].posX = x;
      this.frames[0].posY = y;
    }
    if (pos.nextItem) {
      const endX = pos.nextItem.x;
      const endY = pos.nextItem.y;
      const { endIndex } = pos;
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

  toJSON() {
    const positions = [];
    let pos = this.firstPosition;
    while (pos) {
      positions.push(pos.toJSON());
      pos = pos.nextItem;
    }
    return {
      positions
    };
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

  toJSON() {
    const { index, x, y } = this;
    return {
      index,
      x,
      y
    };
  }
}
