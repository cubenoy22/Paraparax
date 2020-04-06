import React from 'react';

export default class VideoRenderer extends React.Component {

  constructor() {
    super();
    this.state = {
      canvasW: 0,
      canvasH: 0,
      cursorX: 0,
      cursorY: 0,
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

  onMouseMove(e) {
    const r = e.target.getBoundingClientRect();
    this.setState({
      cursorX: Math.floor(e.clientX - r.left),
      cursorY: Math.floor(e.clientY - r.top)
    });
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
    const { currentIndex, renderingArea: ra, clipToBounds } = this.props;
    const frame = this.frames[currentIndex];
    ctx.save();

    const { canvasW, canvasH } = this.state;
    ctx.filter = frame.filterText;
    if (clipToBounds) {
      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.beginPath();
      ctx.rect(ra.x, ra.y, ra.w || canvasW, ra.h || canvasH);
      ctx.clip();
    }
    ctx.translate(canvasW / 2, canvasH / 2);
    ctx.rotate(frame.angle * Math.PI / 180);
    ctx.translate(-canvasW / 2, -canvasH / 2);
    ctx.drawImage(this.bitmaps[currentIndex], frame.posX, frame.posY);
    ctx.restore();
  }

  captureStream() {
    return this.canvasRef.current.captureStream();
  }

  getScale() {
    return this.props.isHighRes ? 0.5 : 1;
  }

  render() {
    return (
      <div style={{position: 'relative'}}>
        <canvas
          ref={this.canvasRef}
          width={this.state.canvasW}
          height={this.state.canvasH}
          onMouseMove={this.onMouseMove.bind(this)}
          onClick={ this.props.togglePlaying }
          style={{
            border: '1px solid red'
          }}
        />
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: '0',
          pointerEvents: 'none'
        }}>
          <p>{`${this.state.cursorX}, ${this.state.cursorY}`}</p>
        </div>
      </div>
    );
  }
}
