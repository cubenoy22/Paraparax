import React from 'react';
import Draggable from 'react-draggable';

import './VideoFrameList.css';
import classNames from 'classnames';

export default class VideoFrameList extends React.Component {

  render() {
    const { frames, timeline, startFrameIndex, endFrameIndex, onCurrentIndexChange, currentIndex } = this.props;
    return (
      <div className='VideoFrameList'>
        <div className='VideoFrameListRange'>
          <div className='VideoFrameListRangeSlider'
            style={{
              left: startFrameIndex * 17,
              right: (frames.length - endFrameIndex) * 17
            }}
          />
          <Draggable
            axis='x'
            grid={[17, 0]}
            position={{x: startFrameIndex * 17, y: 0}}
            bounds={{top: 0, left: 0, right: (frames.length - 1) * 17, bottom: 0}}
            onDrag={ this.onRangeStartChange.bind(this) }
          >
            <div className='VideoFrameListRangeSliderHandle' />
          </Draggable>
          <Draggable
            axis='x'
            grid={[17, 0]}
            position={{x: -(frames.length - endFrameIndex) * 17, y: 0}}
            bounds={{top: 0, left: -(frames.length - 1) * 17, right: 0, bottom: 0}}
            onDrag={ this.onRangeEndChange.bind(this) }
          >
            <div className='VideoFrameListRangeSliderHandle' />
          </Draggable>
        </div>
        <div className='VideoFrameListFrameContainer'>
          { frames.map((frame, index) => (
            <div
              key={ frame.file.name }
              className='VideoFrameListFrame'
              onClick={ () => {onCurrentIndexChange(index)} }
            >
              <div className={classNames({
                'is-selected': index === currentIndex
              })} />
              <div className='attributes'>
                { (timeline.hasPositionAt(index)) ? (<div>p</div>) : <div>&nbsp;</div> }
                { (timeline.hasDelayAt(index)) ? (<div>d</div>) : <div>&nbsp;</div> }
                { (timeline.hasFilterAt(index)) ? (<div>f</div>) : <div>&nbsp;</div> }
              </div>
            </div>
          )) }
        </div>
      </div>
    );
  }

  onRangeStartChange(e, data) {
    this.props.onStartFrameIndexChange(Math.round(data.x / 17));
  }

  onRangeEndChange(e, data) {
    const { frames } = this.props;
    this.props.onEndFrameIndexChange(frames.length + Math.round(data.x / 17));
  }
}
