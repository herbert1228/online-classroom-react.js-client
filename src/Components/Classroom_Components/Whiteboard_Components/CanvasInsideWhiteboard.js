import React from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Image} from 'react-konva'

const styles = theme => ({
})

class CanvasInsideWhiteboard extends React.Component {
    ctx = null
    state = {
        canvas: null,
        mode: this.props.mode,
        isMouseDown: false,
        lineWidth: this.props.lineWidth,
        lineColor: this.props.lineColor,
        point_record: {},
        undoStack:[],
        redoStack: []
    }

    componentDidMount() {
        const canvas = document.createElement('canvas')
        canvas.width = 800
        canvas.height = 600
        this.ctx = canvas.getContext('2d')
        this.setState({canvas})
    }

    handleMouseDown = (e) => {
      //console.log("mousedown")
      console.log("line color in child is", this.props.lineColor)
      //console.log("line color in child is", this.state.lineColor)
      this.setState({ isMouseDown: true })
      var stage = this.image.parent.parent
      this.lastPointerPosition = stage.getPointerPosition()

      if (this.props.mode === "draw") {
        var point_record = {
          mode: this.props.mode,
          lineWidth: this.props.lineWidth,
          lineColor: this.props.lineColor,
          point: []
        }
      } else if (this.props.mode === "eraser") {
        var point_record = {
          mode: this.props.mode,
          lineWidth: this.props.lineWidth,
          point: []
        }
      }
      this.setState({point_record: point_record})
    }

    handleMouseUp = () => {
      this.setState({ isMouseDown: false })
      if (this.state.point_record.point.length > 0) {
        //this.state.undoStack.push(this.state.point_record)
        this.setState({undoStack: [...this.state.undoStack, this.state.point_record]})
      }
    }

    handleMouseMove = (e) => {
      const { isMouseDown} = this.state

      if(isMouseDown) {
        console.log("mode is ", this.props.mode)
        this.ctx.save()

        this.ctx.strokeStyle = this.props.lineColor
        this.ctx.lineJoin = "round"
        this.ctx.lineWidth = this.props.lineWidth

        if (this.props.mode === "draw") {
          this.ctx.globalCompositeOperation = "source-over"

        } else if (this.props.mode === "eraser") {
          this.ctx.globalCompositeOperation = "destination-out"
        }

        this.ctx.beginPath()

        var localPos = {
          x: this.lastPointerPosition.x - this.image.x(),
          y: this.lastPointerPosition.y - this.image.y()
        }
        this.ctx.moveTo(localPos.x, localPos.y)
        console.log("moveTo", localPos)
        this.state.point_record.point.push({mouseX: localPos.x, mouseY: localPos.y})
        var stage = this.image.parent.parent
        var pos = stage.getPointerPosition()

        localPos = {
          x: pos.x - this.image.x(),
          y: pos.y - this.image.y()
        }
        this.ctx.lineTo(localPos.x, localPos.y)
        console.log("lineTo", localPos)
        this.state.point_record.point.push({mouseX: localPos.x, mouseY: localPos.y})

        this.ctx.closePath()
        this.ctx.stroke()

        this.lastPointerPosition = pos
        this.image.getLayer().draw()

        this.ctx.restore()
        console.log(this.state.point_record)
        }
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
            />
        )
    }
}


export default withStyles(styles)(CanvasInsideWhiteboard);
