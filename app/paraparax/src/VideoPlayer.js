import React from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Dropzone from 'react-dropzone';
import Draggable from 'react-draggable';

import './VideoPlayer.css';
import VideoRenderer from './VideoRenderer';
import Frame from './Frame';
import VideoFrameList from './VideoFrameList';
import Timeline from './Timeline';
import ValueEditor from './ValueEditor';

export default class VideoPlayer extends React.Component {

  constructor() {
    super();
    this.state = {
      currentIndex: 0,
      frames: [],
      timeline: null,
      startFrameIndex: 0,
      endFrameIndex: 0,
      lastModified: new Date(),
      isPlaying: false,
      loop: true,
      reverse: false,
      loopBackAndForth: false,
      hasRecordedVideo: false,
      renderingArea: {
        x: 0,
        y: 0,
        w: 0,
        h: 0
      },
      clipToBounds: false,
      isHighRes: false,
    };
    this.rendererRef = React.createRef();
    this.saveLinkRef = React.createRef();
    this.saveVideoLinkRef = React.createRef();
  }

  render() {
    const {
      isPlaying,
      frames,
      currentIndex,
      timeline,
      startFrameIndex,
      endFrameIndex,
      lastModified,
      reverse,
      loop,
      loopBackAndForth,
      renderingArea,
      clipToBounds,
      isHighRes
    } = this.state;
    return (
      <>
        <KeyboardEventHandler
          handleKeys={[
            'space',
            'left', 'right',
            'shift+left', 'shift+up', 'shift+right', 'shift+down',
            'shift+alt+left', 'shift+alt+up', 'shift+alt+right', 'shift+alt+down',
          ]}
          onKeyEvent={ this.onKeyEvent.bind(this) }
        />
        <div className='App-Overlay'>
          <div>
            <Dropzone onDrop={ this.onChange.bind(this) } multiple={true} noclick={true} >
              {({getRootProps, getInputProps}) => (
                <section>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>ファイルを開く…</p>
                  </div>
                </section>
              )}
            </Dropzone>
            <button onClick={ this.onSave.bind(this) }>保存</button>
            <button onClick={ this.onRecord.bind(this) }>{this.mediaRecorder ? '録画停止' : '録画開始'}</button>
            <a href='/' ref={ this.saveLinkRef } style={{display: 'none'}}>Save</a>
            <a href='/' ref={ this.saveVideoLinkRef } style={{
              visibility: this.state.hasRecordedVideo ? 'visible' : 'hidden'
            }}>Save Video</a>
          </div>
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '0'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateRows: '3px calc(100% - 3px)',
              gridTemplateColumns: '3px calc(100% - 3px)',
            }}>
              <div></div>
              <div style={{
                display: 'flex',
                alignItems: 'center'
              }}>
                <Draggable
                  axis='y'
                >
                  <div style={{
                    width: '100%',
                    height: '1px',
                    background: 'green',
                    cursor: 'row-resize',
                    zIndex: 9999
                  }}></div>
                </Draggable>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <Draggable
                    axis='x'
                  >
                    <div style={{
                      width: '1px',
                      height: '100%',
                      background: 'green',
                      cursor: 'col-resize',
                      zIndex: 9999
                    }}></div>
                  </Draggable>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'black'
              }}>
                <VideoRenderer
                  ref={ this.rendererRef }
                  frames={ frames }
                  currentIndex={ currentIndex }
                  togglePlaying={ this.togglePlaying.bind(this) }
                  lastModified={ lastModified }
                  renderingArea={ renderingArea }
                  clipToBounds={ clipToBounds }
                  isHighRes={ isHighRes }
                />
              </div>
            </div>
            <div style={{
              height: '100px',
              background: '#333c',
              overflow: 'scroll hidden'
            }}>
              <VideoFrameList
                isPlaying={ isPlaying }
                frames={ frames }
                timeline={ timeline }
                currentIndex={ currentIndex }
                startFrameIndex={ startFrameIndex }
                endFrameIndex={ endFrameIndex }
                onCurrentIndexChange={ this.onCurrentIndexChange.bind(this) }
                onStartFrameIndexChange={ this.onStartFrameIndexChange.bind(this) }
                onEndFrameIndexChange={ this.onEndFrameIndexChange.bind(this) }
              />
            </div>
          </div>
          <ValueEditor
            isPlaying={ isPlaying }
            reverse={ reverse }
            loop={ loop }
            loopBackAndForth={ loopBackAndForth }
            frames={ frames }
            timeline={ timeline }
            currentIndex={ currentIndex }
            renderingArea={ renderingArea }
            clipToBounds={ clipToBounds }
            isHighRes={ isHighRes }
            onTimelineChange={ this.onTimelineChange.bind(this)}
            onLoopChange={ this.onLoopChange.bind(this) }
            onReverseChange={ this.onReverseChange.bind(this) }
            onRenderingAreaChange={ this.onRenderingAreaChange.bind(this) }
            onClipToBoundsChange={ this.onClipToBoundsChange.bind(this) }
            onIsHighResChange={ this.onIsHighResChange.bind(this) }
          />
        </div>
      </>
    );
  }

  onKeyEvent(key, e) {
    if (key === 'space') {
      this.togglePlaying();
      return;
    }

    const { currentIndex, frames, timeline } = this.state;
    const frame = frames[currentIndex];
    switch (key) {
      case 'left': (() => {
          const nextIndex = currentIndex - 1;
          this.setState({
            currentIndex: nextIndex >= 0 ? nextIndex : frames.length - 1
          });
        })();
        break;
      case 'right': (() => {
          const nextIndex = currentIndex + 1;
          this.setState({
            currentIndex: nextIndex < frames.length ? nextIndex : 0
          });
        })();
        break;
      case 'shift+left':
        timeline.setPositionAt(currentIndex, frame.posX - 1, frame.posY);
        this.setState({ lastModified: new Date() });
        break;
      case 'shift+up':
        timeline.setPositionAt(currentIndex, frame.posX, frame.posY - 1);
        this.setState({ lastModified: new Date() });
        break;
      case 'shift+right':
        timeline.setPositionAt(currentIndex, frame.posX + 1, frame.posY);
        this.setState({ lastModified: new Date() });
        break;
      case 'shift+down':
        timeline.setPositionAt(currentIndex, frame.posX, frame.posY + 1);
        this.setState({ lastModified: new Date() });
        break;
      case 'shift+alt+left':
          timeline.setPositionAt(currentIndex, frame.posX - 10, frame.posY);
          this.setState({ lastModified: new Date() });
          break;
        case 'shift+alt+up':
          timeline.setPositionAt(currentIndex, frame.posX, frame.posY - 10);
          this.setState({ lastModified: new Date() });
          break;
        case 'shift+alt+right':
          timeline.setPositionAt(currentIndex, frame.posX + 10, frame.posY);
          this.setState({ lastModified: new Date() });
          break;
        case 'shift+alt+down':
          timeline.setPositionAt(currentIndex, frame.posX, frame.posY + 10);
          this.setState({ lastModified: new Date() });
          break;
      default:
      }
    e.preventDefault();
  }

  onChange(acceptedFiles) {
    this.pause();
    const imageFiles = acceptedFiles.filter(f => f.type.startsWith('image/')).sort((a, b) => (a.name > b.name ? 1 : -1));
    const configFile = acceptedFiles.find(f => f.type === 'application/json');
    const frames = Array.from(imageFiles).map(file => new Frame(file));
    if (configFile) {
      const reader = new FileReader();
      reader.onload = e => {
        const {
          timeline,
          startFrameIndex,
          endFrameIndex,
          loop,
          loopBackAndForth,
          reverse,
          renderingArea,
          isHighRes
        } = JSON.parse(e.target.result);
        this.setState({
          frames: frames,
          timeline: new Timeline(frames, timeline),
          startFrameIndex,
          endFrameIndex,
          loop,
          loopBackAndForth,
          reverse,
          renderingArea: renderingArea || { x: 0, y: 0, w: 0, h: 0 },
          isHighRes,
        });
      };
      reader.readAsText(configFile);
    } else {
      this.setState({
        frames: frames,
        timeline: new Timeline(frames),
        startFrameIndex: 0,
        endFrameIndex: imageFiles.length,
        loop: true,
        loopBackAndForth: false,
        reverse: false,
        isHighRes: false
      });
    }
  }

  togglePlaying() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    const { frames, currentIndex } = this.state;
    window.setTimeout(this.onNextFrame.bind(this), frames[currentIndex].delay);
    this.setState({
      isPlaying: true
    });
  }

  pause() {
    if (this.state.isPlaying) {
      this.setState({
        isPlaying: false
      });
    }
  }

  onNextFrame() {
    const { isPlaying, currentIndex, startFrameIndex, endFrameIndex, reverse, loop, loopBackAndForth, frames } = this.state;
    let nextIndex;
    const diffState = {};
    if (reverse) {
      nextIndex = currentIndex - 1;
      if (nextIndex < startFrameIndex) {
        if (loopBackAndForth) {
          nextIndex = startFrameIndex + 1;
          diffState.reverse = !reverse;
        } else {
          if (loop) {
            nextIndex = endFrameIndex - 1;
          } else {
            nextIndex = startFrameIndex;
            diffState.isPlaying = false;
          }
        }
      }
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= endFrameIndex) {
        if (loopBackAndForth) {
          nextIndex = endFrameIndex - 1;
          diffState.reverse = !reverse;
        } else {
          if (loop) {
            nextIndex = startFrameIndex;
          } else {
            nextIndex = endFrameIndex - 1;
            diffState.isPlaying = false;
          }
        }
      }
    }
    diffState.currentIndex = nextIndex;
    this.setState(diffState);
    if (diffState.isPlaying || isPlaying) {
      window.setTimeout(this.onNextFrame.bind(this), frames[nextIndex].delay);
    }
  }

  onCurrentIndexChange(index) {
    this.setState({
      currentIndex: index
    });
  }

  onStartFrameIndexChange(index) {
    this.setState({
      startFrameIndex: index
    });
  }

  onEndFrameIndexChange(index) {
    this.setState({
      endFrameIndex: index
    })
  }

  onSave() {
    const {
      timeline,
      startFrameIndex,
      endFrameIndex,
      loop,
      loopBackAndForth,
      reverse,
      renderingArea,
      isHighRes
    } = this.state;
    const json = JSON.stringify({
      timeline: timeline.toJSON(),
      startFrameIndex,
      endFrameIndex,
      loop,
      loopBackAndForth,
      reverse,
      renderingArea,
      isHighRes
    });
    (() => {
      const link = this.saveLinkRef.current;
      link.href = URL.createObjectURL(new Blob([json], {type: 'text/plain'}));
      link.download = 'config.json';
      link.click();
    })();
  }

  onRecord() {
    if (this.videoChunks && this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = (e) => {
        const link = this.saveVideoLinkRef.current;
        link.href = URL.createObjectURL(new Blob(this.videoChunks), { type: 'video/webm' });
        link.download = 'video.webm';
        this.videoChunks = null;
        this.mediaRecorder = null;
        this.setState({
          hasRecordedVideo: true
        });
      };
      return;
    }

    const stream = this.rendererRef.current.captureStream();
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.ondataavailable = (e) => {
      this.videoChunks.push(e.data);
    };
    this.videoChunks = [];
    this.videoSaveURL = null;
    this.mediaRecorder.start();
    this.setState({
      hasRecordedVideo: false
    });
  }

  onTimelineChange() {
    this.setState({ lastModified: new Date() });
  }

  onLoopChange(loop, loopBackAndForth) {
    if (loop !== undefined) {
      this.setState({
        loop,
        loopBackAndForth: false
      });
    } else if (loopBackAndForth !== undefined) {
      this.setState({
        loop: false,
        loopBackAndForth
      });
    }
  }

  onReverseChange(reverse) {
    this.setState({
      reverse
    });
  }

  onRenderingAreaChange(renderingArea) {
    this.setState({
      renderingArea
    });
  }

  onClipToBoundsChange(clipToBounds) {
    this.setState({
      clipToBounds,
      lastModified: new Date()
    });
  }

  onIsHighResChange(isHighRes) {
    this.setState({
      isHighRes,
      lastModified: new Date()
    });
  }
}
