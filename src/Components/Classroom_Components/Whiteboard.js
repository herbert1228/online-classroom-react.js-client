import React, { Fragment } from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Divider, Button} from '@material-ui/core'
import RndContainer from '../Classroom_Components/RndContainer'
import {Stage, Layer, Text, Image} from 'react-konva'
import Rectangle from './Whiteboard_Components/Rectangle'
import TransformerComponent from './Whiteboard_Components/TransformerComponent'
import CanvasInsideWhiteboard from './Whiteboard_Components/CanvasInsideWhiteboard'
import { CompactPicker } from 'react-color'
import penButton from "./thumbnail/pen.png"
import eraserButton from "./thumbnail/eraser.png"
import downloadButton from "./thumbnail/download.png"
// import { SketchPicker } from 'react-color'
import Portal from './Whiteboard_Components/Portal'
import {genid} from '../../interface/connection'

const styles = theme => ({
    card: {
        width: '100%',
        height: '100%'
    },
    // avatar: {
    //     backgroundColor: "#769da8"
    // },
    stage: {height: '800', width: '674'},
    panel: { width: '100%'}
})

function defaultText() {
    return {type: "text", x: 40, y: 40, text:"New Text\nwith Line Break", fontSize: 18, fontFamily: "Calibri", fill: 'blue', name: genid()}
}

function defaultRect() {
    return {type: "rectangle", x: 150, y: 150, width: 100, height: 100, fill: 'grey', name: genid()}
}

class Whiteboard extends React.Component {
    textAreaRef = {}
    state = {
        permission: this.props.user === this.props.self,
        objects: [{type: "whiteboard", name: "whiteboard"}],
        inputBox: [],
        selectedShapeName: '',
        lineColor: "#000000",
        lineWidth: 4,
        mode: "draw",
        startDownload: false,
        cursor: {x: null, y: null},
        image: null,
    }

    handleStageMouseDown = e => {
        // clicked on stage/whiteboard - clear selection
        if (e.target === e.target.getStage() || e.target.name === "whiteboard") {
            this.setState({selectedShapeName: ''})
            return
        }

        const name = e.target.name()
        const obj = this.state.objects.find(r => r.name === name)

        // clicked on transformer - do nothing
        if (e.target.getParent().className === 'Transformer') return
        if (obj) {this.setState({selectedShapeName: name})}
        else {this.setState({selectedShapeName: ''})}
    }

    handleZIndex = type => { // type = "top" || "bottom"
        const obj = this.state.objects.find(r => r.name === this.state.selectedShapeName)
        if (!obj) {
            this.props.handleNotification("No object selected!")
            return
        }
        this.state.objects.splice(this.state.objects.indexOf(obj), 1)
        if (type === "top") {
            this.setState({objects: [...this.state.objects, obj]})
        } else if (type === "bottom") {
            const whiteboard = this.state.objects.find(r => r.name === "whiteboard")
            this.state.objects.splice(this.state.objects.indexOf(whiteboard), 1)
            this.setState({objects: [whiteboard, obj, ...this.state.objects]})
        } else throw new Error("Invalid type for handleZIndex")
    }

    handleRemove = () => {
        const obj = this.state.objects.find(r => r.name === this.state.selectedShapeName)
        if (!obj) {
            this.props.handleNotification("No object selected!")
            return
        }
        this.state.objects.splice(this.state.objects.indexOf(obj), 1)
    }
    
    handleMouseMove = e => {
        var stage = e.currentTarget // same as: stage = this.stageRef.getStage(), or: stage = e.target.getStage()
        this.setState({ cursor: stage.getPointerPosition() })
    }

    handleEditText = obj => {
        if (this.textAreaRef[obj.name]) return
        const stageX = this.stageRef.container().getBoundingClientRect().x
        const stageY = this.stageRef.container().getBoundingClientRect().y
        this.setState({inputBox: [
            ...this.state.inputBox,
            <textarea
                ref={ref => this.textAreaRef[obj.name] = ref}
                key={obj}
                style={{
                    position: 'absolute',
                    top: stageY + obj.y,
                    left: stageX + obj.x,
                    width: '200px',
                    zIndex: 9999999
                }}
                defaultValue={obj.text}
                onKeyDown={e => {
                    if (e.keyCode === 13 && !e.shiftKey) {
                        const remoteTarget = this.state.inputBox.find(r => r === this.textAreaRef[obj.name])
                        this.state.inputBox.splice(this.state.inputBox.indexOf(remoteTarget), 1)

                        const editingText = this.state.objects.find(r => r.name === obj.name)
                        this.state.objects.splice(this.state.objects.indexOf(editingText), 1)
                        let modifliedText = editingText
                        modifliedText.text = this.textAreaRef[obj.name].value
                        this.layerRef.draw()

                        this.setState({objects: [...this.state.objects, modifliedText]})
                       
                        this.setState({inputBox: [
                            ...this.state.inputBox
                        ]})
                        delete this.textAreaRef[obj.name]
                    }
                }}
            />
        ]})
        this.textAreaRef[obj.name].focus()
    }

    handleColorChange = (color, event) => {
      this.setState({ lineColor: color.hex})
      console.log("lineColor is parent is ", this.state.lineColor)
    }

    decreaseLineWidth = () => {
      if(this.state.lineWidth > 3) {
        this.setState({lineWidth: this.state.lineWidth - 3})
      } else {
          this.props.handleNotification("Already reached minimum line width")
      }
    }

    increaseLineWidth = () => {
      if(this.state.lineWidth <=24) {
        this.setState({lineWidth: this.state.lineWidth + 3})
      } else {
            this.props.handleNotification("Already reached maximum line width")
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
                    elevation={7}
                    onDragOver={() => console.log("onDragOver")} //!!! e.preventDefault()
                    onDrop={() => console.log("onDrop")} // e.preventDefault() then add image at pointer position
                >
                    <CardHeader //this height is 74px
                        title="Whiteboard"
                        subheader={
                            (this.props.joined.owner === this.props.user? 'Teacher: ' : '') 
                            + this.props.user
                            + (this.state.permission? '' : ' (Read Only)')
                        }
                        id={`draggable${id}`}
                        style={{height: 50}}
                    />
                    <Divider/>
                    {this.state.permission && 
                        <Fragment>
                            <div className={classes.panel}>
                                <Button onClick={()=> this.setState({objects: [...this.state.objects, defaultText()]})}>
                                    Add Text
                                </Button>
                                <Button onClick={()=> this.setState({objects: [...this.state.objects, defaultRect()]})}>
                                    Add Rect
                                </Button>
                                {/* <SketchPicker/> */}
                                <Button onClick={() => this.handleZIndex("top")}>
                                    Top
                                </Button>
                                <Button onClick={() => this.handleZIndex("bottom")}>
                                    Bottom
                                </Button>
                                <Button onClick={this.handleRemove}>
                                    Remove
                                </Button>
                                {/* <span id="color" ref="color">
                                <CompactPicker color={ this.state.lineColor}
                                                onChangeComplete={ this.handleColorChange}/>
                                </span> */}

                                <span id="lineWidth" ref="lineWidth">
                                    <Button onClick={this.decreaseLineWidth}><b>-</b></Button>
                                    <Button onClick={this.increaseLineWidth}><b>+</b></Button>
                                </span>

                                <span id="pen" ref="pen">
                                    <Button onClick={() => this.setState({mode:"draw"})}>
                                        <img alt="btn-eraser" id="btn-eraser" src={penButton} width="20" height="20"/>
                                    </Button>
                                </span>

                                <span id="eraser" ref="eraser">
                                <Button onClick={() => this.setState({mode:"eraser"})}>
                                    <img alt="btn-eraser" id="btn-eraser" src={eraserButton} width="20" height="20"/>
                                </Button>
                                </span>

                                {/* <span id="download" ref="download">
                                    <Button onClick={this.startDownload}>
                                        <img
                                        alt="btn-download" id="btn-download" src={downloadButton}
                                        width="20" height="20"/>
                                    </Button>
                                </span> */}
                            </div>
                            <Divider/>
                        </Fragment>
                    }
                    <Stage width={800} height={600}
                        ref={ref=>this.stageRef=ref}
                        onClick={()=>console.log(this.stageRef.getPointerPosition())}
                        // onDragMove = { () => {console.log("aaa")}}
                        onMouseMove={this.handleMouseMove}
                        onMouseDown={this.handleStageMouseDown}>
                        <Layer ref={ref=>this.layerRef=ref}>
                            {this.state.objects.map((obj, i) => {
                                if (obj === undefined) console.log(obj)
                                else if (obj.type === "whiteboard")
                                    return <CanvasInsideWhiteboard 
                                                key="whiteboard"
                                                lineColor={ this.state.lineColor }
                                                lineWidth={ this.state.lineWidth }
                                                mode={ this.state.mode }
                                                startDownload={ this.state.startDownload }
                                                user={this.props.user}
                                            />
                                else if (obj.type === "rectangle") 
                                    return <Rectangle key={obj.name} {...obj}/>
                                else if (obj.type === "text") 
                                    return <Text key={obj.name} {...obj} draggable onDblClick={() => this.handleEditText(obj)}/>
                                else if (obj.type === "image") 
                                    return <Image />
                                return <Image />
                            })}
                            <TransformerComponent selectedShapeName={this.state.selectedShapeName}/>
                            {/* <Image
                                image = {this.state.image}
                            /> */}
                            <Portal>
                                {this.state.inputBox}
                                {/* <input style={{
                                    zIndex: 99999,
                                    position: "absolute",
                                    top: this.stageRef? this.stageRef.container().getBoundingClientRect().x + 100 : 0,
                                    left: this.stageRef? this.stageRef.container().getBoundingClientRect().y + 100 : 0,
                                }} placeholder="testing"/> */}
                            </Portal>
                        </Layer>
                    </Stage>
                </Card>
            </RndContainer>
        )
    }
}

export default withStyles(styles)(Whiteboard);
