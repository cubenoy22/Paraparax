import React from 'react';

export default class ValueEditor extends React.Component {

  render() {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '300px'
      }}>
        <div>
          <h3>フレーム</h3>
          <h4>位置</h4>
          x: <input type='text' value={ this.getFrameX() } disabled></input><br />
          y: <input type='text' value={ this.getFrameY() } disabled></input>
          <button disabled={ !this.canDeleteFramePosition() } onClick={ this.deleteCurrentPosition.bind(this) }>削除</button>
          <h4>フィルター</h4>
        </div>
      </div>
    );
  }

  shouldComponentUpdate() {
    return !this.props.isPlaying;
  }

  canDeleteFramePosition() {
    const { currentIndex, timeline } = this.props;
    if (currentIndex < 1) {
      return false;
    }

    if (!timeline) {
      return false;
    }
    return timeline.hasPositionAt(currentIndex);
  }

  getFrameX() {
    const { frames, currentIndex, timeline } = this.props;
    const frame = frames[currentIndex];
    if (!frame) {
      return '';
    }
    const hasPosition = timeline && timeline.hasPositionAt(currentIndex);
    return `${frame.posX}${hasPosition ? '' : ' (補完)'}`;
  }

  getFrameY() {
    const { frames, currentIndex, timeline } = this.props;
    const frame = frames[currentIndex];
    if (!frame) {
      return '';
    }
    const hasPosition = timeline && timeline.hasPositionAt(currentIndex);
    return `${frame.posY}${hasPosition ? '' : ' (補完)'}`;
  }

  deleteCurrentPosition() {
    const { currentIndex, timeline, onTimelineChange } = this.props;
    timeline.deletePositionAt(currentIndex);
    onTimelineChange();
  }
}
