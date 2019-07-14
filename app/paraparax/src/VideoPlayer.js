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
    };
    this.fileRef = React.createRef();
    this.saveLinkRef = React.createRef();
  }

  render() {
    const { isPlaying, frames, currentIndex, timeline, startFrameIndex, endFrameIndex, lastModified, reverse, loop, loopBackAndForth } = this.state;
    return (
      <>
        <KeyboardEventHandler
          handleKeys={['space', 'left', 'up', 'right', 'down', 'shift']}
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
            <a href='/' ref={ this.saveLinkRef } style={{display: 'none'}}>Save</a>
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
                    cursor: 'row-resize'
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
                      cursor: 'col-resize'
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
                  frames={ frames }
                  currentIndex={ currentIndex }
                  togglePlaying={ this.togglePlaying.bind(this) }
                  lastModified={ lastModified }
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
            onTimelineChange={ this.onTimelineChange.bind(this)}
            onLoopChange={ this.onLoopChange.bind(this) }
            onReverseChange={ this.onReverseChange.bind(this) }
          />
        </div>
      </>
    );
  }

  onKeyEvent(key, e) {
    if (e.keyCode === 32) {
      this.togglePlaying();
      return;
    }

    const { currentIndex, frames, timeline } = this.state;
    const frame = frames[currentIndex];
    const shift = e.ctrlKey ? 10 : 1;
    switch (e.keyCode) {
      case 37: // ArrowLeft
        if (e.shiftKey) {
          timeline.setPositionAt(currentIndex, frame.posX - shift, frame.posY);
          this.setState({ lastModified: new Date() });
        } else {
          const nextIndex = currentIndex - 1;
          this.setState({
            currentIndex: nextIndex >= 0 ? nextIndex : frames.length - 1
          });
        }
        break;
      case 38: // ArrowUp
        if (e.shiftKey) {
          timeline.setPositionAt(currentIndex, frame.posX, frame.posY - shift);
          this.setState({ lastModified: new Date() });
        }
        break;
      case 39: // ArrowRight
        if (e.shiftKey) {
          timeline.setPositionAt(currentIndex, frame.posX + shift, frame.posY);
          this.setState({ lastModified: new Date() });
        } else {
          const nextIndex = currentIndex + 1;
          this.setState({
            currentIndex: nextIndex < frames.length ? nextIndex : 0
          });
        }
        break;
      case 40: // ArrowDown
        if (e.shiftKey) {
          timeline.setPositionAt(currentIndex, frame.posX, frame.posY + shift);
          this.setState({ lastModified: new Date() });
        }
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
        const { timeline, startFrameIndex, endFrameIndex, loop, loopBackAndForth, reverse } = JSON.parse(e.target.result);
        this.setState({
          frames: frames,
          timeline: new Timeline(frames, timeline),
          startFrameIndex,
          endFrameIndex,
          loop,
          loopBackAndForth,
          reverse
        });
      };
      reader.readAsText(configFile);
    } else {
      frames[0].delay = 1000 / 30;
      this.setState({
        frames: frames,
        timeline: new Timeline(frames),
        startFrameIndex: 0,
        endFrameIndex: imageFiles.length,
        loop: true,
        loopBackAndForth: false,
        reverse: false
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
    window.setTimeout(this.onNextFrame.bind(this), 1000 / 30);
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
    const { isPlaying, currentIndex, startFrameIndex, endFrameIndex, reverse, loop, loopBackAndForth } = this.state;
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
      window.setTimeout(this.onNextFrame.bind(this), 1000 / 30);
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
    const { timeline, startFrameIndex, endFrameIndex, loop, loopBackAndForth, reverse } = this.state;
    const json = JSON.stringify({
      timeline: timeline.toJSON(),
      startFrameIndex,
      endFrameIndex,
      loop,
      loopBackAndForth,
      reverse
    });
    (() => {
      const link = this.saveLinkRef.current;
      link.href = URL.createObjectURL(new Blob([json], {type: 'text/plain'}));
      link.download = 'config.json';
      link.click();
    })();
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
}
