import React from 'react';

export default class ValueEditor extends React.Component {

  render() {
    const { reverse, loop, loopBackAndForth, onLoopChange, onReverseChange } = this.props;
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
        overflowY: 'scroll'
      }}>
        <div>
          <h3>Player</h3>
          <label>
            <input
              type="checkbox"
              checked={ loop }
              onChange={ (e) => { onLoopChange(e.target.checked, undefined); } }
            />Loop
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={ reverse }
              disabled={ loopBackAndForth }
              onChange={ (e) => { onReverseChange(e.target.checked); } }
            />Reverse
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              checked={ loopBackAndForth }
              onChange={ (e) => { onLoopChange(undefined, e.target.checked); } }
            />Loop Back and Forth
          </label>
          <h3>Frames</h3>
          <h4>Playing</h4>
          delay: <input type='text' value={ this.getFrameDelay() } onChange={ this.onDelayChange.bind(this) }></input>
          <button disabled={ !this.canDeleteFrameDelay() } onClick={ this.deleteCurrentDelay.bind(this) }>Delete</button>
          <h4>Position</h4>
          X: <input type='text' value={ this.getFrameX() } disabled></input><br />
          Y: <input type='text' value={ this.getFrameY() } disabled></input><br />
          <button disabled={ !this.canDeleteFramePosition() } onClick={ this.deleteCurrentPosition.bind(this) }>Delete</button>
          <h4>Filter</h4>
          <label><input type='range' min='0' max='100' value={ this.getFilterValue('blur') } onChange={ e => { this.onFilterChange('blur', e); } } />Blur</label>
          <label><input type='range' min='0' max='800' value={ this.getFilterValue('brightness') } onChange={ e => { this.onFilterChange('brightness', e); } } />Brightness</label>
          <label><input type='range' min='0' max='800' value={ this.getFilterValue('contrast') } onChange={ e => { this.onFilterChange('contrast', e); } } />Contrast</label>
          <label><input type='range' min='0' max='100' value={ this.getFilterValue('grayscale') } onChange={ e => { this.onFilterChange('grayscale', e); } } />Grayscale</label>
          <label><input type='range' min='0' max='360' value={ this.getFilterValue('hueRotate') } onChange={ e => { this.onFilterChange('hueRotate', e); } } />HueRotate</label>
          <label><input type='range' min='0' max='100' value={ this.getFilterValue('invert') } onChange={ e => { this.onFilterChange('invert', e); } } />Invert</label>
          <label><input type='range' min='0' max='100' value={ this.getFilterValue('opacity') } onChange={ e => { this.onFilterChange('opacity', e); } } />Opacity</label>
          <label><input type='range' min='0' max='400' value={ this.getFilterValue('saturate') } onChange={ e => { this.onFilterChange('saturate', e); } } />Saturate</label>
          <label><input type='range' min='0' max='100' value={ this.getFilterValue('sepia') } onChange={ e => { this.onFilterChange('sepia', e); } } />Sepia</label>
          <br />
          <button disabled={ !this.canDeleteFilter() } onClick={ this.deleteCurrentFilter.bind(this) }>Delete</button>
        </div>
      </div>
    );
  }

  // shouldComponentUpdate() {
  //   return !this.props.isPlaying;
  // }

  canDeleteFramePosition() {
    const { currentIndex, timeline } = this.props;
    if (currentIndex < 1 || !timeline) {
      return false;
    }
    return timeline.hasPositionAt(currentIndex);
  }

  canDeleteFrameDelay() {
    const { currentIndex, timeline } = this.props;
    if (currentIndex < 1 || !timeline) {
      return false;
    }
    return timeline.hasDelayAt(currentIndex);
  }

  canDeleteFilter() {
    const { currentIndex, timeline } = this.props;
    if (currentIndex < 1 || !timeline) {
      return false;
    }
    return timeline.hasFilterAt(currentIndex);
  }

  getFrameDelay() {
    const { frames, currentIndex } = this.props;
    const frame = frames[currentIndex];
    if (!frame) {
      return '';
    }
    return frame.delay;
  }

  getFrameX() {
    const { frames, currentIndex } = this.props;
    const frame = frames[currentIndex];
    if (!frame) {
      return '';
    }
    return `${frame.posX}`;
  }

  getFrameY() {
    const { frames, currentIndex } = this.props;
    const frame = frames[currentIndex];
    if (!frame) {
      return '';
    }
    return `${frame.posY}`;
  }

  getFilterValue(key) {
    const { frames, currentIndex } = this.props;
    const frame = frames[currentIndex];
    if (!frame) {
      return 0;
    }
    return frame.filter[key];
  }

  deleteCurrentPosition() {
    const { currentIndex, timeline, onTimelineChange } = this.props;
    timeline.deletePositionAt(currentIndex);
    onTimelineChange();
  }

  deleteCurrentDelay() {
    const { currentIndex, timeline, onTimelineChange } = this.props;
    timeline.deleteDelayAt(currentIndex);
    onTimelineChange();
  }

  onDelayChange(e) {
    const { currentIndex, timeline, onTimelineChange } = this.props;
    timeline.setDelayAt(currentIndex, Number(e.target.value));
    onTimelineChange();
  }

  deleteCurrentFilter() {
    const { currentIndex, timeline, onTimelineChange } = this.props;
    timeline.deleteFilterAt(currentIndex);
    onTimelineChange();
  }

  onFilterChange(filterName, e) {
    const { currentIndex, frames, timeline, onTimelineChange } = this.props;
    const filter = frames[currentIndex].filter;
    filter[filterName] = Number(e.target.value);
    timeline.setFilterAt(currentIndex, filter);
    onTimelineChange();
  }
}
