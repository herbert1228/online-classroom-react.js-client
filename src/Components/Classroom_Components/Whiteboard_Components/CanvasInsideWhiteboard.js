import React from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Image} from 'react-konva'
import { WhiteboardChannel } from '../../../interface/connection'

const styles = theme => ({
})

class CanvasInsideWhiteboard extends React.Component {
    ctx = null
    state = {
        canvas: null,
        bbox: null,
        mode: this.props.mode,
        isMouseDown: false,
        lineWidth: this.props.lineWidth,
        lineColor: this.props.lineColor,
        point_record: {},
        undoStack:[],
        redoStack: [],
        lines: [] // [{line: [], type: {color, width}}]
    }

    componentDidMount() {
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 600
        this.ctx = canvas.getContext('2d')
        this.setState({canvas})
        // const bbox = canvas.getBoundingClientRect()
        const stage = this.image.parent.parent
        this.setState({stage})
        requestAnimationFrame(this.refresh)
    }

    // handleMouseDown = (e) => {
    //   //console.log("mousedown")
    //   console.log("line color in child is", this.props.lineColor)
    //   //console.log("line color in child is", this.state.lineColor)
    //   this.setState({ isMouseDown: true })
    //   var stage = this.image.parent.parent
    //   this.lastPointerPosition = stage.getPointerPosition()

    //   if (this.props.mode === "draw") {
    //     var point_record = {
    //       mode: this.props.mode,
    //       lineWidth: this.props.lineWidth,
    //       lineColor: this.props.lineColor,
    //       point: []
    //     }
    //   } else if (this.props.mode === "eraser") {
    //     var point_record = {
    //       mode: this.props.mode,
    //       lineWidth: this.props.lineWidth,
    //       point: []
    //     }
    //   }
    //   this.setState({point_record: point_record})
    // }

    // handleMouseUp = () => {
    //   this.setState({ isMouseDown: false })
    //   if (this.state.point_record.point.length > 0) {
    //     //this.state.undoStack.push(this.state.point_record)
    //     this.setState({undoStack: [...this.state.undoStack, this.state.point_record]})
    //   }
    // }

    // handleMouseMove = (e) => {
    //   const { isMouseDown} = this.state

    //   if(isMouseDown) {
    //     console.log("mode is ", this.props.mode)
    //     this.ctx.save()

    //     this.ctx.strokeStyle = this.props.lineColor
    //     this.ctx.lineJoin = "round"
    //     this.ctx.lineWidth = this.props.lineWidth

    //     if (this.props.mode === "draw") {
    //       this.ctx.globalCompositeOperation = "source-over"

    //     } else if (this.props.mode === "eraser") {
    //       this.ctx.globalCompositeOperation = "destination-out"
    //     }

    //     this.ctx.beginPath()

    //     var localPos = {
    //       x: this.lastPointerPosition.x - this.image.x(),
    //       y: this.lastPointerPosition.y - this.image.y()
    //     }
    //     this.ctx.moveTo(localPos.x, localPos.y)
    //     console.log("moveTo", localPos)
    //     this.state.point_record.point.push({mouseX: localPos.x, mouseY: localPos.y})
    //     var stage = this.image.parent.parent
    //     var pos = stage.getPointerPosition()

    //     localPos = {
    //       x: pos.x - this.image.x(),
    //       y: pos.y - this.image.y()
    //     }
    //     this.ctx.lineTo(localPos.x, localPos.y)
    //     console.log("lineTo", localPos)
    //     this.state.point_record.point.push({mouseX: localPos.x, mouseY: localPos.y})

    //     this.ctx.closePath()
    //     this.ctx.stroke()

    //     this.lastPointerPosition = pos
    //     this.image.getLayer().draw()

    //     this.ctx.restore()
    //     console.log(this.state.point_record)
    //     }
    // }

    handleMouseDown = (e) => {
        const {lines} = this.state
        let [x, y] = getLocalCoord(this.state.stage, e.evt) //e = {evt: MouseEvent, target, currentTarget, type}
        this.setState({isMouseDown: true})
        if (this.props.mode === "draw") {
            this.setState({
                lines: [
                    ...this.state.lines, 
                    {line: [[x, y]], type: {color: this.props.lineColor, width: this.props.lineWidth}}
                ]
            })
            // lines.line.push([[x, y]])
        } else if (this.props.mode === "eraser") {
            let radius = 10
            this.setState({lines: lines.filter(line => !eraserInRange(line, x, y, radius))})
        }
    }
  
    handleMouseUp = () => {
        if (!this.state.isMouseDown) return
        const {lines} = this.state
        this.setState({isMouseDown: false})
        if (this.props.mode === "draw") {
    
            // discard empty line
            if (lines[lines.length - 1].line.length === 0) {
                lines.splice(lines.length - 1, 1)
                return
            }

            // send to server
            WhiteboardChannel.draw(this.props.user, lines[lines.length - 1].line)
        }
    }
    
    handleMouseMove = e => {
        const {lines} = this.state
        let [x, y] = getLocalCoord(this.state.stage, e.evt)
        if (!this.state.isMouseDown) return

        if (this.props.mode === "draw") {
            var line = lines[lines.length - 1]
            line.line.push([x, y])
        } else if (this.props.mode === "eraser") { // TODO not working
            let radius = 10
            this.setState({lines: lines.filter(line => !eraserInRange(line, x, y, radius))})
        }
    }

    refresh= () => {
        const {lines} = this.state
        this.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height)

        for (let line of lines) {
            drawQuadraticCurve(this.ctx, line)
        }

        this.image.getLayer().draw() // source from where?

        // console.log(`mode: ${this.props.mode}, active: ${this.state.isMouseDown}, lines: ${JSON.stringify(lines)}`)
        requestAnimationFrame(this.refresh)
    }
  
    render() {
        return (
            <Image
                x={0}
                y={0}
                image={this.state.canvas}
                ref={node => (this.image = node)}
                shadowBlur={1}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onMouseMove={this.handleMouseMove}
                onMouseOut={this.handleMouseUp}
            />
        )
    }
}

function eraserInRange(line, ex, ey, radius) {
  for (let [px, py] of line.line) {
      if (intersectCircle(px, py, ex, ey, radius)) {
          return true
      }
  }
  return false
}

function intersectCircle(px, py, ex, ey, radius) {
  return (px - ex) * (px - ex) + (py - ey) * (py - ey) <= radius * radius
}

function drawStraightLine(ctx, line) {
    if (line.line.length === 0) return
    let [fx, fy] = line.line[0]

    ctx.beginPath()
    ctx.lineJoin = "round"
    ctx.strokeStyle = line.type.color
    ctx.lineWidth = line.type.width
    ctx.moveTo(fx, fy)
    for (let [x, y] of line.line) {
        ctx.lineTo(x, y)
    }
    ctx.stroke()
}

function drawQuadraticCurve(ctx, line) {
    const ppts = line.line
    if (ppts.length < 3) return

    ctx.beginPath()
    ctx.lineJoin = "round"
    ctx.strokeStyle = line.type.color
    ctx.lineWidth = line.type.width
    ctx.moveTo(ppts[0][0], ppts[0][1])

    let i
    for (i = 1; i < ppts.length - 2; i ++) {
        var xc = (ppts[i][0] + ppts[i + 1][0]) / 2
        var yc = (ppts[i][1] + ppts[i + 1][1]) / 2
        ctx.quadraticCurveTo(ppts[i][0], ppts[i][1], xc, yc)
    }

    // curve through the last two points
    ctx.quadraticCurveTo(ppts[i][0], ppts[i][1], ppts[i+1][0], ppts[i+1][1])
    ctx.stroke()
}

function drawStraightLineWithHightlight(ctx, line) {
    if (line.length === 0) return
    let [fx, fy] = line[0]

    ctx.beginPath()
    ctx.moveTo(fx, fy)
    for (let [x, y] of line) {
        ctx.lineTo(x, y)
    }
    ctx.stroke()

    var radius = 3
    for (let [x, y] of line) {
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI)
        ctx.fill()
    }
}

function getLocalCoord(stage, {clientX, clientY}) {
    const bbox = stage.getPointerPosition()
    // return [clientX - bbox.x, clientY - bbox.y]
    return [bbox.x, bbox.y]
}


export default withStyles(styles)(CanvasInsideWhiteboard);
