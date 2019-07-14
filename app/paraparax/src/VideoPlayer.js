import React from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Dropzone from 'react-dropzone';

import './VideoPlayer.css';
import VideoRenderer from './VideoRenderer';
import Frame from './Frame';
import VideoFrameList from './VideoFrameList';
import Timeline from './Timeline';

export default class VideoPlayer extends React.Component {

  constructor() {
    super();
    this.state = {
      currentIndex: 0,
      frames: [],
      timeline: null,
      startFrameIndex: 0,
      endFrameIndex: 0,
      lastModified: new Date()
    };
    this.fileRef = React.createRef();
    this.saveLinkRef = React.createRef();
    this.timer = null;
  }

  render() {
    const { frames, currentIndex, timeline, startFrameIndex, endFrameIndex, lastModified } = this.state;
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
              gridTemplateRows: '18px calc(100% - 18px)',
              gridTemplateColumns: '18px calc(100% - 18px)',
            }}>
              <div></div>
              <div></div>
              <div></div>
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
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '300px',
            background: '#333a',
            color: 'white'
          }} />
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
    switch (e.keyCode) {
      case 37: // ArrowLeft
        if (e.shiftKey) {
          timeline.setPositionAt(currentIndex, frame.posX - 10, frame.posY);
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
          timeline.setPositionAt(currentIndex, frame.posX, frame.posY - 10);
          this.setState({ lastModified: new Date() });
        }
        break;
      case 39: // ArrowRight
        if (e.shiftKey) {
          timeline.setPositionAt(currentIndex, frame.posX + 10, frame.posY);
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
          timeline.setPositionAt(currentIndex, frame.posX, frame.posY + 10);
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
        const json = JSON.parse(e.target.result);
        this.setState({
          frames: frames,
          timeline: new Timeline(frames, json.timeline),
          startFrameIndex: json.startFrameIndex,
          endFrameIndex: json.endFrameIndex
        });
      };
      reader.readAsText(configFile);
    } else {
      this.setState({
        frames: frames,
        timeline: new Timeline(frames),
        endFrameIndex: imageFiles.length
      });
    }
  }

  togglePlaying() {
    if (this.timer) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.timer) {
      this.timer = window.setInterval(this.onNextFrame.bind(this), 1000 / 30);
    }
  }

  pause() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  onNextFrame() {
    const { currentIndex, startFrameIndex ,endFrameIndex } = this.state;
    const nextIndex = currentIndex + 1;
    this.setState({
      currentIndex: nextIndex < endFrameIndex ? nextIndex : startFrameIndex
    });
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
    const { timeline, startFrameIndex, endFrameIndex } = this.state;
    const json = JSON.stringify({
      timeline: timeline.toJSON(),
      startFrameIndex,
      endFrameIndex
    });
    (() => {
      const link = this.saveLinkRef.current;
      link.href = URL.createObjectURL(new Blob([json], {type: 'text/plain'}));
      link.download = 'config.json';
      link.click();
    })();
  }
}
