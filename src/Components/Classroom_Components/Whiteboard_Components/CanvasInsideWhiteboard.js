import React, { Component }  from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Stage, Layer, Image} from 'react-konva'
import { shape } from 'prop-types';

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
        canvas.width = 400
        canvas.height = 600
        this.ctx = canvas.getContext('2d')
        this.setState({canvas})
        this.drag_n_drop()
        if (this.props.startDownload) {
          this.download()
        }
    }

    download = () => {
      var image = this.canvas.toDataURL("image/png", 1.0)
      var link = document.createElement("a")
      link.download = "whiteboard-image.png"
      link.href = image
      link.click()
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

      //console.log(this.state.point_record.point.length)
      if (this.state.point_record.point.length > 0) {
        //this.state.undoStack.push(this.state.point_record)
        this.setState({undoStack: [...this.state.undoStack, this.state.point_record]})
      }
      //console.log(this.state)

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

    drag_n_drop () {
      var img = document.createElement("img")
      var mouseDown = false

      img.addEventListener("load", () => {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.drawImage(img, this.canvas.width/2 - img.width/2,
                          this.canvas.height/2 - img.height/2)
      })

      this.canvas.addEventListener("dragover", (event) => {
        event.preventDefault()
        console.log("dragging")
      }, false)

      this.canvas.addEventListener("drop", (event) => {
        var files = event.dataTransfer.files
        if(files.length > 0) {
          var file = files[0]
          if(typeof FileReader !== "undefined" && file.type.indexOf("image") !== -1) {
            var reader = new FileReader()
            reader.onload = (event) => {
              var img = new Image()
              img.onload = () => {
                this.ctx.drawImage(img, this.canvas.width/2 - img.width/2,
                                  this.canvas.height/2 - img.height/2)
              }
              img.src = event.target.result

              var img_record = {
                                  mode: "loadImg",
                                  image: event.target.result
                                }
              this.state.historyAsObject.undoStack.push(img_record)
            }
            reader.readAsDataURL(file)
          }
        }
        event.preventDefault()
      }, false)

      this.canvas.addEventListener("mousedown", (event) => {
        mouseDown = true
      }, false)

      this.canvas.addEventListener("mouseup", (event) => {
        mouseDown = false
      })
    }

    render() {
        return (
            <Image
                x={400}
                y={0}
                image={this.state.canvas}
                ref={node => (this.image = node)}
                stroke={"green"}
                shadowBlur={5}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onMouseMove={this.handleMouseMove}
            />
        )
    }
}


export default withStyles(styles)(CanvasInsideWhiteboard);
