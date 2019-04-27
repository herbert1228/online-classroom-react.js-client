import React from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Image} from 'react-konva'
import { GroupWhiteboardChannel } from '../../../interface/connection'
// import _ from 'lodash'

const styles = theme => ({
})

class CanvasInsideGroupWhiteboard extends React.Component {
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

    componentDidUpdate(prevProps){
        const { linesReceived, erasedLines } = this.props
        this.drawReceivedLines(linesReceived, prevProps.linesReceived)
        this.removeErasedLines(erasedLines, prevProps.erasedLines)
    }

    // sync new lines
    drawReceivedLines = (linesReceived, prevLinesReceived) => {
        if (!linesReceived) return
        if (linesReceived.length === 0) return
        if (prevLinesReceived === linesReceived) return
        // for (let data of linesReceived) 
        this.setState({
            lines: [
                ...this.state.lines, 
                ...linesReceived
            ]
        })
    }

    //sync deleted lines
    removeErasedLines = (erasedLines, prevErasedLines) => {
        if (!erasedLines) return
        if (erasedLines.length === 0) return
        if (prevErasedLines === erasedLines) return

        // console.log(compareArrOfObj(erasedLines, this.state.lines))
        this.setState({
            lines: this.state.lines.filter(
                line => !erasedLines.some(other => JSON.stringify(line) === JSON.stringify(other))
            )
        })
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
            GroupWhiteboardChannel.draw(
                this.props.user,
                {
                    type: "canvasDraw", 
                    lines: {
                        line: lines[lines.length - 1].line,
                        type: {
                            color: this.props.lineColor, 
                            width: this.props.lineWidth
                        }
                    }
                }
            )
        }
    }

    handleMouseDown = (e) => { //e = {evt: MouseEvent, target, currentTarget, type}
        this.setState({isMouseDown: true})
        this.commonMoveOrDownHandler(e, true)
    }
    
    handleMouseMove = e => {
        if (!this.state.isMouseDown) return
        this.commonMoveOrDownHandler(e, false)
    }

    commonMoveOrDownHandler = (e, mousedown) => {
        const {lines} = this.state
        let [x, y] = getLocalCoord(this.state.stage, e.evt)
        if (this.props.mode === "eraser") {
            const radius = 10
            const newLines = lines.filter(line => !eraserInRange(line, x, y, radius))
            const erasedLines = lines.filter(line => eraserInRange(line, x, y, radius))

            if ((!lines) || (lines.length === newLines.length)) return
            this.setState({lines: newLines})
            GroupWhiteboardChannel.draw(
                this.props.user,
                { type: "canvas erase", erasedLines }
            )

        } else if (this.props.mode === "draw") {
            if (mousedown) {
                this.setState({
                    lines: [
                        ...this.state.lines, 
                        {line: [[x, y]], type: {color: this.props.lineColor, width: this.props.lineWidth}}
                    ]
                })
            } else {
                var line = lines[lines.length - 1]
                line.line.push([x, y])
            }
        }
    }

    refresh= () => {
        const {lines} = this.state
        this.ctx.clearRect(0, 0, this.state.canvas.width, this.state.canvas.height)

        for (let line of lines) {
            drawQuadraticCurve(this.ctx, line)
        }

        if (this.image) this.image.getLayer().draw() // source from where?

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

// eslint-disable-next-line
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

function drawDot(ctx, line) {
    let [fx, fy] = line.line[0]
    ctx.beginPath()
    ctx.arc(fx, fy, line.type.width/2 , 0, 2 * Math.PI)
    ctx.fill()
}

function drawQuadraticCurve(ctx, line) {
    const ppts = line.line
    if (ppts.length < 3) {
        drawDot(ctx, line)
        return
    }

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

// eslint-disable-next-line
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

export default withStyles(styles)(CanvasInsideGroupWhiteboard);
