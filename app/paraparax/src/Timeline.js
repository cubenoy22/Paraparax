export default class Timeline {
  constructor(frames, parsedJson) {
    this.frames = frames;
    if (parsedJson) {
      let prevItem;
      // JSONからPositionItemのチェーンを作成
      const items = parsedJson.positions.map(aData => {
        const item = new PositionItem(aData.index, frames, undefined, prevItem, aData.x, aData.y);
        if (prevItem) {
          prevItem.nextItem = item;
        }
        prevItem = item;
        return item;
      });
      this.firstPosition = items[0];
      this.applyPositionsToFrames();
    } else {
      this.firstPosition = new PositionItem(0, frames);
    }
  }

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

  getPositionFor(index) {
    return this.getItemFor(
      index,
      this.firstPosition,
      (index, frames, pos, prevPos) => new PositionItem(index, frames, pos, prevPos));
  }

  getItemFor(index, firstItem, constructor) {
    let pos = firstItem;
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
        const result = constructor(index, this.frames, pos, prevPos);
        prevPos.nextItem = result;
        pos.prevItem = result;
        return result;
      }
    }
    const result = constructor(index, this.frames, undefined, prevPos);
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

  deletePositionAt(index) {
    if (index > 0) {
      let item = this.firstPosition.nextItem;
      while (item) {
        if (item.index === index) {
          const nextItem = item.nextItem;
          item.prevItem.nextItem = nextItem;
          if (nextItem) {
            nextItem.prevItem = item.prevItem;
          }
          this.applyPositionsToFrames();
          return;
        }
        item = item.nextItem;
      }
    } else {
      const item = this.firstPosition;
      item.x = 0;
      item.y = 0;
      this.applyPositionsToFrames();
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
