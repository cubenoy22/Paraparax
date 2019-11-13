import React from 'react';

export default class VideoRenderer extends React.Component {

  constructor() {
    super();
    this.state = {
      canvasW: 0,
      canvasH: 0,
    };
    this.bitmaps = [];
    this.frames = [];
    this.canvasRef = React.createRef();
    this.graphicsCtx = undefined;
  }

  componentDidMount() {
    this.graphicsCtx = this.canvasRef.current.getContext('2d');
  }

  componentDidUpdate(prevProps) {
    const { currentIndex, frames, lastModified } = this.props;
    const { currentIndex: prevIndex, frames: prevFrames, lastModified: prevLastModified } = prevProps;
    if (currentIndex !== prevIndex || lastModified !== prevLastModified) {
      this.drawFrame();
    } else if (frames !== prevFrames) {
      this.load(frames);
    }
    return null;
  }

  async load(frames) {
    this.frames = frames;
    if (frames.length < 1) {
      this.bitmaps = [];
      this.setState({
        canvasW: 0,
        canvasH: 0
      });
      return;
    }

    this.bitmaps = await Promise.all(frames.map(frame => createImageBitmap(frame.file)));
    this.setState({
      canvasW: this.bitmaps[0].width,
      canvasH: this.bitmaps[0].height
    });
    this.drawFrame();
  }

  drawFrame() {
    const ctx = this.graphicsCtx;
    const { currentIndex } = this.props;
    const frame = this.frames[currentIndex];
    ctx.save();
    // ctx.clearRect(0, 0, this.state.canvasW, this.state.canvasH);
    ctx.filter = frame.filterText;
    ctx.drawImage(this.bitmaps[currentIndex], frame.posX, frame.posY);
    ctx.restore();
  }

  captureStream() {
    return this.canvasRef.current.captureStream();
  }

  render() {
    return (
      <canvas
        ref={this.canvasRef}
        width={this.state.canvasW}
        height={this.state.canvasH}
        onClick={ this.props.togglePlaying }
        style={{
          border: '1px solid red'
        }}
      />
    );
  }
}
