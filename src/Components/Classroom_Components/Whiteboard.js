import React, { Component } from 'react';
import { render } from 'react-dom'
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Divider, Button} from '@material-ui/core'
import RndContainer from '../Classroom_Components/RndContainer'
import {Stage, Layer, Text, Image} from 'react-konva'
import Rectangle from './Whiteboard_Components/Rectangle'
import TransformerComponent from './Whiteboard_Components/TransformerComponent'
import CanvasInsideWhiteboard from './Whiteboard_Components/CanvasInsideWhiteboard'
import Portal from './Whiteboard_Components/Portal'
import { CompactPicker } from 'react-color'
import penButton from "./thumbnail/pen.png"
import eraserButton from "./thumbnail/eraser.png"
import downloadButton from "./thumbnail/download.png"

const styles = theme => ({
    card: {
        width: '100%',
        height: '100%'
    },
    avatar: {
        backgroundColor: "#769da8"
    },
    stage: {height: '800', width: '674'},
    panel: {
        height: 100,
        width: '100%'
    },

})

class Whiteboard extends React.Component {
    state = {
        drawRight: 'Read Only',
        camOpen: true,
        isDraggingText: false,
        rectangles: [
            {x: 40, y: 40, width: 100, height: 100, fill: 'grey', name: 'rect1'},
            {x: 150, y: 150, width: 100, height: 100, fill: 'green', name: 'rect2'}
        ],
        selectedShapeName: '',
        lineColor: "#000000",
        lineWidth: 5,
        mode: "draw",
        startDownload: false
        }


    componentDidMount() {
        console.log(this.stage.getContainer())
    }

    handleStageMouseDown = e => {
        // clicked on stage - clear selection
        if (e.target === e.target.getStage()) {
            this.setState({selectedShapeName: ''})
            return
        }

        // clicked on transformer - do nothing
        if (e.target.getParent().className === 'Transformer') return

        //find clicked rect by its name
        const name = e.target.name()
        const rect = this.state.rectangles.find(r => r.name === name)
        if (rect) {this.setState({selectedShapeName: name})}
        else {this.setState({selectedShapeName: ''})}
        console.log("selectedShapeName:", this.state.selectedShapeName)
    }

    handleColorChange = (color, event) => {
      this.setState({ lineColor: color.hex})
      console.log("lineColor is parent is ", this.state.lineColor)
    }

    decreaseLineWidth = () => {
      if(this.state.lineWidth > 5) {
        this.setState({lineWidth: this.state.lineWidth - 5})
      }
    }

    increaseLineWidth = () => {
      if(this.state.lineWidth <=25) {
        this.setState({lineWidth: this.state.lineWidth + 5})
      }
    }

    startDownload = () => {
      this.setState({ startDownload: true })
    }

    render() {
        const {classes, id, ...other} = this.props;

        return (
            <RndContainer id={id} {...other}>
                <Card className={classes.card}
                    onDragOver={() => console.log("onDragOver")} //!!! e.preventDefault()
                    onDrop={() => console.log("onDrop")} // e.preventDefault() then add image at pointer position
                >
                    <CardHeader //this height is 74px
                        title="Whiteboard"
                        subheader="Teacher"
                        id={`draggable${id}`}
                        style={{height: 50}}
                    />
                    <Divider/>
                    <div className={classes.panel}>
                        <Button onClick={()=> {
                            let defaultRect = {x: 40, y: 40, width: 100, height: 100, fill: 'grey', name: 'rect1'}
                            this.setState({rectangles: [...this.state.rectangles, defaultRect]
                        })}}>Add Rect</Button>

                        <span id="color" ref="color">
                          <CompactPicker color={ this.state.lineColor}
                                         onChangeComplete={ this.handleColorChange}/>
                        </span>

                        <span id="lineWidth" ref="lineWidth">
                            <Button onClick={this.decreaseLineWidth}><b>-</b></Button>
                            <Button onClick={this.increaseLineWidth}><b>+</b></Button>
                        </span>

                        <span id="pen" ref="pen">
                            <img onClick={() => this.setState({mode:"draw"})}
                            alt="btn-eraser" id="btn-eraser" src={penButton}
                            width="40px" height="40px"/>
                        </span>

                        <span id="eraser" ref="eraser">
                            <img onClick={() => this.setState({mode:"eraser"})}
                            alt="btn-eraser" id="btn-eraser" src={eraserButton}
                            width="40px" height="40px"/>
                        </span>

                        <span id="download" ref="download">
                            <img onClick={this.startDownload}
                            alt="btn-download" id="btn-download" src={downloadButton}
                            width="40px" height="40px" />
                        </span>


                    </div>
                    <Divider/>
                    <Stage width={800} height={600}
                        ref={ref=>this.stage=ref}
                        onMouseDown={this.handleStageMouseDown}>
                        <Layer>
                            {this.state.rectangles.map((rect, i) => (
                                <Rectangle key={i} {...rect}/>
                            ))}
                            <TransformerComponent selectedShapeName={this.state.selectedShapeName}/>
                            <Text
                                text="Draggable Text" name="draggableText"
                                x={10} y={10} draggable
                                fill={this.state.isDraggingText ? 'green' : 'black'}
                                onDragStart={() => this.setState({isDraggingText: true})}
                                onDragEnd={() => this.setState({isDraggingText: false})}
                            />
                            <CanvasInsideWhiteboard lineColor={ this.state.lineColor }
                                                    lineWidth={ this.state.lineWidth }
                                                    mode={ this.state.mode }
                                                    startDownload={ this.state.startDownload }
                                                    ref={this.child}
                            />
                            {/* <Portal>
                                <input
                                    style={{
                                        position: 'absolute',
                                        top: 10,
                                        left: 10,
                                        width: '200px'
                                    }}
                                    placeholder="Some text here"
                                />
                            </Portal> */}
                        </Layer>
                    </Stage>
                </Card>
            </RndContainer>
        )
    }
}

export default withStyles(styles)(Whiteboard);
