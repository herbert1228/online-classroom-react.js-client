import React from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Image} from 'react-konva'

const styles = theme => ({
})

class CanvasInsideWhiteboard extends React.Component {
    ctx = null
    state = {
        canvas: null,
        mode: "draw",
        isMouseDown: false,
        lineWidth: 5,
        lineColor: "black",
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
      console.log("mousedown")
      this.setState({ isMouseDown: true })
      var stage = this.image.parent.parent
      this.lastPointerPosition = stage.getPointerPosition()

      if (this.state.mode === "draw") {
        var point_record = {
                            mode: "draw",
                            lineWidth: this.state.lineWidth,
                            lineColor: this.state.lineColor,
                            point: []
                           }
      } else if (this.state.mode === "eraser") {
        var point_record = {
                            mode: "eraser",
                            lineWidth: this.state.lineWidth,
                            point: []
                          }
      }
      this.setState({point_record: point_record})
    }

    handleMouseUp = () => {
      this.setState({ isMouseDown: false })

      console.log(this.state.point_record.point.length)
      if (this.state.point_record.point.length > 0) {
        //this.state.undoStack.push(this.state.point_record)
        this.setState({undoStack: [...this.state.undoStack, this.state.point_record]})
      }
      console.log(this.state)
    }

    handleMouseMove = (e) => {
      const { isMouseDown, mode, lineColor, lineWidth } = this.state

      if(isMouseDown) {
        console.log("dragging")
        this.ctx.save()

        this.ctx.strokeStyle = lineColor
        this.ctx.lineJoin = "round"
        this.ctx.lineWidth = lineWidth

        
        if (mode === "draw") {
          this.ctx.globalCompositeOperation = "source-over"       

        } else if (mode === "eraser") {
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
        }
    }
    render() {
        return (
            <Image
                x={0}
                y={0}
                image={this.state.canvas}
                ref={node => (this.image = node)}
                shadowBlur={5}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onMouseMove={this.handleMouseMove}
            />
        )
    }
}


export default withStyles(styles)(CanvasInsideWhiteboard);
