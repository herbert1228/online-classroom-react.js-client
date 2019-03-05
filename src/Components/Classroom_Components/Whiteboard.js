import React, { Fragment } from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Divider, Button} from '@material-ui/core'
import RndContainer from '../Classroom_Components/RndContainer'
import {Stage, Layer, Text, Image, Rect} from 'react-konva'
import Rectangle from './Whiteboard_Components/Rectangle'
import TransformerComponent from './Whiteboard_Components/TransformerComponent'
import CanvasInsideWhiteboard from './Whiteboard_Components/CanvasInsideWhiteboard'
// import { CompactPicker } from 'react-color'
import penButton from "./thumbnail/pen.png"
import eraserButton from "./thumbnail/eraser.png"
// import downloadButton from "./thumbnail/download.png"
// import { SketchPicker } from 'react-color'
import Portal from './Whiteboard_Components/Portal'
import {genid, WhiteboardChannel} from '../../interface/connection'

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

function defaultImage(image) {
    return {type: "image", x: 137, y: 250, width: 400, height: 300, image, name: genid()}
}

class Whiteboard extends React.Component {
    textAreaRef = {}
    state = {
        connected: false,
        permission: this.props.user === this.props.self,
        objects: [],
        inputBox: [],
        selectedShapeName: '',
        lineColor: "#000000",
        lineWidth: 4,
        mode: "draw",
        startDownload: false,
        cursor: {x: null, y: null},
        image: null,
        canvasReceived: null,
        canvasMode: false,
    }

    async componentDidMount() {
        let result
        WhiteboardChannel.onReceiveDraw(this.props.user, this.handleReceiveDraw)
        if (isOwner(this.props)) {
            result = await WhiteboardChannel.start()
            this.setState({connected: true})
            console.log(result)
        } else {
            if (this.props.session_user.includes(this.props.user)) {
                do {
                    result = await WhiteboardChannel.connect(this.props.user)
                    console.log(result)
                } while(!Array.isArray(result))
                this.setState({connected: true})
            }
        }
    }

    async componentWillReceiveProps({session_user}){
        if (isOwner(this.props)) return
        if (this.state.connected) return
        let result
        if (session_user.includes(this.props.user)) {
            do {
                result = await WhiteboardChannel.connect(this.props.user)
                // console.log(result)
            } while(result.reason === "pending")

            if (result.length > 0) {
                let canvasReceived = []
                for (let data of result) {
                    if (data.type === "canvasDraw") {
                        canvasReceived.push(data.lines)
                    }
                }
                this.setState({canvasReceived})
            }
            this.setState({connected: true})
        }
    }

    handleReceiveDraw = data => {
        if (data.type === "canvasDraw") {
            this.setState({canvasReceived: [data.lines]})
        }
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

    handleEditText = (e, obj) => {
        if (this.textAreaRef[obj.name]) return
        const stageX = this.stageRef.container().getBoundingClientRect().x
        const stageY = this.stageRef.container().getBoundingClientRect().y
        this.setState({selectedShapeName: ''})
        this.setState({inputBox: [
            ...this.state.inputBox,
            <textarea
                ref={ref => this.textAreaRef[obj.name] = ref}
                key={obj}
                style={{
                    position: 'absolute',
                    top: stageY + obj.y - 10,
                    left: stageX + obj.x - 10,
                    width: e.target.textWidth * e.target.attrs.scaleX + 20,
                    height: e.target.textHeight * e.target.attrs.scaleY * 2 + 20,
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
                        // this.layerRef.draw() // useless?

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

    updatePosOnDragEnd = (objName, {x, y}) => {
        const updateObj = this.state.objects.find(r => r.name === objName)
        this.state.objects.splice(this.state.objects.indexOf(updateObj), 1)
        let modifliedObj = updateObj
        modifliedObj.x = x
        modifliedObj.y = y

        this.setState({objects: [...this.state.objects, modifliedObj]})

        console.log(objName, x, y)
    }

    handleOnDrop = e => {
        e.stopPropagation()
        e.preventDefault()
        const imageUrl = e.dataTransfer.getData('Text')

        const image = new window.Image()
        image.src = imageUrl
        image.onload = () => {
            this.setState({objects: [...this.state.objects, defaultImage(image)]})
        }
    }

    handleNoPermission = () => {
        this.props.handleNotification(`Sorry, please gain permission of this whiteboard from your teacher`)
    }

    changeCanvasMode = () => this.setState({canvasMode: !this.state.canvasMode})

    render() {
        const {classes, id, ...other} = this.props;

        return (
            <RndContainer id={id} {...other}>
                <Card className={classes.card}
                    elevation={7}
                    // onDragOver={() => console.log("onDragOver")} //!!! e.preventDefault()
                    onDrop={this.state.permission? this.handleOnDrop : this.handleNoPermission} // e.preventDefault() then add image at pointer position
                >
                    <CardHeader //this height is 74px
                        title={"Whiteboard"+ (this.state.permission? '' : ' (Read Only)')}
                        subheader={
                            (isTeacher(this.props)? 'Teacher: ' : '') 
                            + this.props.user
                        }
                        id={`draggable${id}`}
                        style={{height: 50}}
                    />
                    <Divider/>
                    {this.state.permission && 
                        <Fragment>
                            <div className={classes.panel}>
                                {!this.state.canvasMode &&
                                    <Fragment>
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
                                        <Button onClick={this.changeCanvasMode}>
                                            Draw
                                        </Button>
                                    </Fragment>
                                }
                                {this.state.canvasMode &&
                                    <Fragment>
                                        {/*
                                        <CompactPicker color={ this.state.lineColor}
                                            onChangeComplete={ this.handleColorChange}
                                        />*/}

                                        <Button onClick={this.decreaseLineWidth}><b>-</b></Button>
                                        <Button onClick={this.increaseLineWidth}><b>+</b></Button>
                                        
                                        {this.state.mode !== "draw" &&
                                        <Button onClick={() => this.setState({mode:"draw"})}>
                                            <img alt="draw" src={penButton} width="20" height="20"/>
                                        </Button>
                                        }
                                        
                                        {this.state.mode !== "eraser" &&
                                        <Button onClick={() => this.setState({mode:"eraser"})}>
                                            <img alt="eraser" src={eraserButton} width="20" height="20"/>
                                        </Button>
                                        }

                                        {/* <span id="download" ref="download">
                                            <Button onClick={this.startDownload}>
                                                <img
                                                alt="btn-download" id="btn-download" src={downloadButton}
                                                width="20" height="20"/>
                                            </Button>
                                        </span> */}

                                        <Button onClick={this.changeCanvasMode}>
                                            Finish Draw
                                        </Button>
                                    </Fragment>
                                }                                
                            </div>
                            <Divider/>
                        </Fragment>
                    }
                    <Stage width={800} height={600}
                        ref={ref=>this.stageRef=ref}
                        // onClick={()=>console.log(this.stageRef.getPointerPosition())}
                        // onDragMove = { () => {console.log("aaa")}}
                        onMouseMove={this.state.permission? this.handleMouseMove : null}
                        onMouseDown={this.state.permission? this.handleStageMouseDown : this.handleNoPermission}
                    >
                        {this.state.canvasMode &&
                        <Layer>
                            {this.state.objects.map((obj, i) => {
                                if (obj === undefined) console.log(obj)
                                else if (obj.type === "rectangle") 
                                    return <Rectangle 
                                                key={obj.name} 
                                                {...obj}
                                                onDragEnd={e => this.updatePosOnDragEnd(obj.name, e.target._lastPos)}
                                            />
                                else if (obj.type === "text")
                                    return <Text 
                                                key={obj.name} 
                                                {...obj} 
                                                draggable 
                                                onDblClick={e => this.handleEditText(e, obj)}
                                                onDragEnd={e => this.updatePosOnDragEnd(obj.name, e.target._lastPos)}
                                            />
                                else if (obj.type === "image") 
                                    return <Image key={obj.name} {...obj} onDragEnd={e => this.updatePosOnDragEnd(obj.name, e.target._lastPos)} draggable/>
                            })}
                            <TransformerComponent selectedShapeName={this.state.selectedShapeName}/>
                            <Portal>
                                {this.state.inputBox}
                            </Portal>
                            {!this.state.permission &&
                                // Intervening transparent Rect
                                <Rect x={0} y={0} width={800} height={600} fill="rgba(0,0,0,0)"/>
                            }
                        </Layer>
                        }
                        <Layer>
                            <CanvasInsideWhiteboard 
                                key="whiteboard"
                                lineColor={ this.state.lineColor }
                                lineWidth={ this.state.lineWidth }
                                mode={ this.state.mode }
                                startDownload={ this.state.startDownload }
                                linesReceived={this.state.canvasReceived}
                                user={this.props.user}
                            />
                        </Layer>
                        {!this.state.canvasMode &&
                        <Layer>
                            {/* Intervening transparent Rect */}
                            <Rect x={0} y={0} width={800} height={600} fill="rgba(0,0,0,0)"/>
                            {this.state.objects.map((obj, i) => {
                                if (obj === undefined) console.log(obj)
                                else if (obj.type === "rectangle") 
                                    return <Rectangle 
                                                key={obj.name} 
                                                {...obj}
                                                onDragEnd={e => this.updatePosOnDragEnd(obj.name, e.target._lastPos)}
                                            />
                                else if (obj.type === "text")
                                    return <Text 
                                                key={obj.name} 
                                                {...obj} 
                                                draggable 
                                                onDblClick={e => this.handleEditText(e, obj)}
                                                onDragEnd={e => this.updatePosOnDragEnd(obj.name, e.target._lastPos)}
                                            />
                                else if (obj.type === "image")
                                    console.log(obj)
                                    return <Image key={obj.name} {...obj} onDragEnd={e => this.updatePosOnDragEnd(obj.name, e.target._lastPos)} draggable/>
                                // return <Canvas />
                            })}
                            <TransformerComponent selectedShapeName={this.state.selectedShapeName}/>
                            {/* <Image
                                image = {this.state.image}
                            /> */}
                            <Portal>
                                {this.state.inputBox}
                            </Portal>
                            {!this.state.permission &&
                                // Intervening transparent Rect
                                <Rect x={0} y={0} width={800} height={600} fill="rgba(0,0,0,0)"/>
                            }
                        </Layer>
                        }
                    </Stage>
                </Card>
            </RndContainer>
        )
    }
}

function isOwner(props) {
    return props.user === props.self
}

function isTeacher(props) {
    return props.joined.owner === props.user
}

export default withStyles(styles)(Whiteboard);
