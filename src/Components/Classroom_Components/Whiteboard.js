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
// import { SketchPicker } from 'react-color'
import Portal from './Whiteboard_Components/Portal'
import {genid, WhiteboardChannel} from '../../interface/connection'

const styles = theme => ({
    card: {
        width: '100%',
        height: '100%'
    },
    stage: {height: '800', width: '674'},
    panel: { width: '100%'},
    normalTitle: {color: "#484747", fontSize: 22},
    teacherTitle: {color: "#ff4500e6", fontSize: 22}
})

const IMAGE_LOAD_TIME = 100

const generalAttrs = {rotation: 0, scaleX: 1, scaleY: 1}

function defaultText() {
    return {type: "text", x: 800/2 - 72, y: 600/2 - 70, text:"Double click\nto edit me", fontSize: 22, fontFamily: "Calibri", fill: '#15474b', name: genid(), ...generalAttrs}
}

function defaultRect() {
    return {type: "rectangle", x: 800/2 - 50, y: 600/2 - 50, width: 100, height: 30, fill: '#ffff0080', name: genid(), ...generalAttrs}
}

function defaultImage(image, name = genid()) {
    return {type: "image", x: 800/2 - 210, y: 600/2 - 180, width: 400, height: 300, image, name, ...generalAttrs}
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
        erasedLines: null,
        canvasMode: false,
    }

    async componentDidMount() {
        let result
        WhiteboardChannel.onReceiveDraw(this.props.user, this.handleActionReceived)
        if (isOwner(this.props)) {
            result = await WhiteboardChannel.start()
            this.setState({connected: true})
            // Get old Whiteboard data from result
            // console.log(result)
        } else {
            if (this.props.session_user.includes(this.props.user)) {
                do {
                    result = await WhiteboardChannel.connect(this.props.user)
                } while(!Array.isArray(result))
                for (let i = result.length - 1; i>=0; i--) { 
                    this.handleActionReceived(result[i])
                }
                this.setState({connected: true})
            }
        }
        console.log("whiteboard: "+ this.props.user)
    }

    componentWillUnmount() {
        WhiteboardChannel.disconnect(this.props.user)
        WhiteboardChannel.removeListener(this.props.user, this.handleActionReceived);
    }

    async componentWillReceiveProps({session_user}){
        if (isOwner(this.props)) return
        if (this.state.connected) return
        let result
        if (session_user.includes(this.props.user)) {
            do {
                result = await WhiteboardChannel.connect(this.props.user)
            } while(result.reason === "pending")

            if (result.length > 0) {
                // elixir use head concatenation for better performance so the result is reversed 
                for (let i = result.length - 1; i>=0; i--) { 
                    this.handleActionReceived(result[i])
                }
            }
            this.setState({connected: true})
        }
    }

    sendWhiteboardAction = (type, args) => {
        WhiteboardChannel.draw(this.props.user, {type, ...args})
    }

    handleActionReceived = data => {
        // console.log(data.type)
        switch (data.type) {
            case "canvasDraw":
                this.setState({canvasReceived: [data.lines]})
                break
            case "canvas erase":
                this.setState({erasedLines: data.erasedLines})
                break
            case "new image":
                const {name, imageUrl} = data
                const image = new window.Image()
                image.crossOrigin = "Anonymous"
                console.log("loading image")
                image.onload = () => {
                    this.setState({objects: [...this.state.objects, defaultImage(image, name)]})
                    console.log("loaded image")
                }
                image.src = imageUrl
                break
            case "new text":
                const {newText} = data
                this.setState({objects: [...this.state.objects, newText]})
                break
            case "new rect":
                const {newRect} = data
                this.setState({objects: [...this.state.objects, newRect]})
                break
            case "drag":
                const {objName, x, y} = data
                this.updatePos(objName, {x, y})
                break
            case "remove":
                const obj = this.state.objects.find(r => r.name === data.targetName)
                if (!obj) {
                    console.warn("Remote deleting an already deleted object")
                    return
                }
                this.state.objects.splice(this.state.objects.indexOf(obj), 1)
                this.refreshWhiteboard()
                break
            case "zIndex":
                const {action, target} = data
                this.handleZIndex(action, false, target)
                break
            case "edit text":
                const {editingText} = data
                const modiflyingText = this.state.objects.find(r => r.name === editingText.name)
                modiflyingText.text = editingText.text
                this.refreshWhiteboard()
                break
            case "transform":
                this.updateTransform(data)
                break
            default:
                console.warn(data)

        } 
        
    }

    handleStageContextMenu = e => {
        e.evt.preventDefault()
        // clicked on stage/whiteboard - clfear selection
        if (e.target === e.target.getStage() || e.target.name === "whiteboard") {
            this.setState({selectedShapeName: ''})
            return
        }
        // const name = e.target.name()
        // const obj = this.state.objects.find(r => r.name === name)
        console.log("context menu")
        const stage = e.currentTarget // same as: stage = this.stageRef.getStage(), or: stage = e.target.getStage()
        console.log(e.evt.clientX+stage.getPointerPosition().x)
        console.log(e.evt.clientY+stage.getPointerPosition().y)
    }

    getMousePos(e) {
        const stage = e.currentTarget // same as: stage = this.stageRef.getStage(), or: stage = e.target.getStage()
        return {
            x: e.evt.clientX+stage.getPointerPosition().x,
            y: e.evt.clientY+stage.getPointerPosition().y
        }
    }

    handleStageMouseDown = e => {
        this.deleteAllInputBox()
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

    handleMouseMove = e => {
        var stage = e.currentTarget // same as: stage = this.stageRef.getStage(), or: stage = e.target.getStage()
        this.setState({ cursor: stage.getPointerPosition() })
    }

    handleZIndex = (type, triggerFromLocal, ...objName) => { // type = "top" || "bottom"
        const obj = triggerFromLocal?
            this.state.objects.find(r => r.name === this.state.selectedShapeName)
            : this.state.objects.find(r => r.name === objName[0])
            
        if (!obj) {
            this.props.handleNotification("No object selected!")
            return
        }
        if (triggerFromLocal) this.sendWhiteboardAction("zIndex", {target: obj.name, action: type})

        this.state.objects.splice(this.state.objects.indexOf(obj), 1)
        if (type === "top") {
            this.setState({objects: [...this.state.objects, obj]})
        } else if (type === "bottom") {
            // const whiteboard = this.state.objects.find(r => r.name === "whiteboard")
            // this.state.objects.splice(this.state.objects.indexOf(whiteboard), 1)
            this.setState({objects: [obj, ...this.state.objects]})
        } else throw new Error("Invalid type for handleZIndex")
    }

    handleRemove = () => {
        const obj = this.state.objects.find(r => r.name === this.state.selectedShapeName)
        if (!obj) {
            this.props.handleNotification("No object selected!")
            return
        }
        this.state.objects.splice(this.state.objects.indexOf(obj), 1)
        this.refreshWhiteboard()
        this.sendWhiteboardAction("remove", {targetName: obj.name})
    }

    handleEditText = (e, obj) => {
        if (this.textAreaRef[obj.name]) return
        const stageX = this.stageRef.container().getBoundingClientRect().x
        const stageY = this.stageRef.container().getBoundingClientRect().y
        this.setState({selectedShapeName: ''})
        this.setState({inputBox: [
            ...this.state.inputBox,
            <textarea
                wrap='off'
                ref={ref => this.textAreaRef[obj.name] = ref}
                key={obj}
                style={{
                    position: 'absolute',
                    overflow: 'scroll',
                    overflowX: 'scroll',
                    overflowY: 'scroll',
                    top: stageY + obj.y - 8,
                    left: stageX + obj.x - 5,
                    width: e.target.textWidth * e.target.attrs.scaleX + 22,
                    // TODO dynamic height
                    height: e.target.textHeight * 1.25 * obj.text.split(/\r*\n/).length * e.target.attrs.scaleY,
                    fontFamily: obj.fontFamily,
                    fontSize: obj.fontSize * e.target.attrs.scaleY,
                    color: obj.fill,
                    zIndex: 9999999,
                    border: 'dotted',
                    outline: 'none',
                    WebkitBoxShadow: 'none',
                    MozBoxShadow: 'none',
                    boxShadow: 'none',
                    resize: 'none'
                }}
                defaultValue={obj.text}
                onKeyDown={e => {
                    if (e.keyCode === 13 && e.shiftKey) {
                        const editingText = this.state.objects.find(r => r.name === obj.name)
                        editingText.text = this.textAreaRef[obj.name].value
                        this.refreshWhiteboard()
                        this.sendWhiteboardAction("edit text", {editingText})
                        this.deleteInputBox(obj.name)
                    }
                }}
                onKeyUp={e => {
                    // same as onKeyDown
                    const editingText = this.state.objects.find(r => r.name === obj.name)
                    editingText.text = this.textAreaRef[obj.name].value
                    this.refreshWhiteboard()

                    const el = this.textAreaRef[obj.name]
                    if (el.scrollHeight > el.clientHeight) el.style.height = (el.scrollHeight) + "px"
                    if (el.scrollWidth > el.clientWidth) el.style.width = (el.scrollWidth) + "px"

                    this.sendWhiteboardAction("edit text", {editingText})
                }}
            />
        ]})
        this.textAreaRef[obj.name].focus()
        this.textAreaRef[obj.name].select()
    }

    deleteInputBox = objName => {
        const remoteTarget = this.state.inputBox.find(r => r === this.textAreaRef[objName])
        this.state.inputBox.splice(this.state.inputBox.indexOf(remoteTarget), 1)

        this.setState({inputBox: [
            ...this.state.inputBox
        ]})
        delete this.textAreaRef[objName]
    }

    deleteAllInputBox = () => {
        for (const inputBox of Object.values(this.textAreaRef)) {
            if (inputBox) this.triggerClick(inputBox)
        }
    }

    triggerClick = target => {
        const keyboardevent = new KeyboardEvent('keydown', {
            key: 'Enter',
            keyCode: 13,
            shiftKey: true,
            view: window,
            bubbles: true,
            cancelable: true
        })
        target.dispatchEvent(keyboardevent)
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

    handleDragEnd = (objName, {x, y}) => {
        this.updatePos(objName, {x, y})
        this.sendWhiteboardAction("drag", {objName, x, y})
    }

    handleTransformEnd = (objName, {x, y, rotation, scaleX, scaleY}) => {
        this.sendWhiteboardAction("transform", {objName, x, y, rotation, scaleX, scaleY})
        this.updateTransform({objName, x, y, rotation, scaleX, scaleY})
    }

    updateTransform = async ({objName, x, y, rotation, scaleX, scaleY}) => {
        let updateObj 
        const interval = setInterval(() => {
            if (updateObj === undefined) {
                updateObj = this.state.objects.find(r => r.name === objName)
            } else {
                clearInterval(interval)

                updateObj.rotation = rotation
                updateObj.scaleX = scaleX
                updateObj.scaleY = scaleY
                updateObj.x = x
                updateObj.y = y
                this.refreshWhiteboard()
            }
        }, IMAGE_LOAD_TIME)        
    }

    updatePos = async (objName, {x, y}) => {
        // const updateObj = this.state.objects.find(r => r.name === objName)
        let updateObj 
        const interval = setInterval(() => {
            if (updateObj === undefined) {
                updateObj = this.state.objects.find(r => r.name === objName)
            } else {
                clearInterval(interval)
                
                const index = this.state.objects.indexOf(updateObj)
                this.state.objects.splice(index, 1)
                let modifliedObj = updateObj
                modifliedObj.x = x
                modifliedObj.y = y
                
                this.state.objects.splice(index, 0, modifliedObj)
                this.refreshWhiteboard()
            }
        }, IMAGE_LOAD_TIME)   
    }

    handleOnDrop = e => {
        e.stopPropagation()
        e.preventDefault()
        const imageUrl = e.dataTransfer.getData('Text')

        const image = new window.Image()
        image.crossOrigin = "Anonymous"
        const newImage = defaultImage(image)
        image.onload = () => {
            this.setState({objects: [...this.state.objects, newImage]})
            this.sendWhiteboardAction("new image", {imageUrl, name: newImage.name})
        }
        image.src = imageUrl
    }

    // this.layerRef.draw() ?
    refreshWhiteboard = () => this.setState({connected: this.state.connected})

    addText = () => {
        const newText = defaultText()
        this.setState({objects: [...this.state.objects, newText]})
        this.sendWhiteboardAction("new text", {newText})
    }
    
    addRect = () => {
        const newRect = defaultRect()
        this.setState({objects: [...this.state.objects, newRect]})
        this.sendWhiteboardAction("new rect", {newRect})
    }

    handleNoPermission = () => {
        this.props.handleNotification(`Read Only`)
    }

    render() {
        const {classes, id, ...other} = this.props;
        return (
            <RndContainer id={id} {...other}>
                <Card className={classes.card}
                    elevation={20}
                    // onDragOver={() => console.log("onDragOver")} //!!! e.preventDefault()
                    onDrop={this.state.permission? this.handleOnDrop : this.handleNoPermission} // e.preventDefault() then add image at pointer position
                >
                    <CardHeader //this height is 74px
                        title={"Whiteboard"+ (this.state.permission? '' : ' (Read Only)')}
                        subheader={
                            (isTeacher(this.props)? 'Teacher: ' : '') 
                            + this.props.user 
                            + ((this.props.user === this.props.self)? ' (yourself)' : '')
                        }
                        id={`draggable${id}`}
                        style={{height: 45, backgroundColor: "#e9e7e74d"}}
                        classes={{title: isTeacher(this.props)? classes.teacherTitle : classes.normalTitle}}
                    />
                    <Divider/>
                    {this.state.permission && 
                        <Fragment>
                            <div className={classes.panel}>
                                {!this.state.canvasMode &&
                                    // TODO below btns need to trigger remove all inputBox
                                    <Fragment>
                                        <Button onClick={this.addText}>
                                            Text
                                        </Button>
                                        <Button onClick={this.addRect}>
                                            Highlighter
                                        </Button>
                                        {/* <SketchPicker/> */}
                                        <Button onClick={() => this.handleZIndex("top", true)}>
                                            Top
                                        </Button>
                                        <Button onClick={() => this.handleZIndex("bottom", true)}>
                                            Bottom
                                        </Button>
                                        <Button onClick={this.handleRemove}>
                                            Remove
                                        </Button>
                                        <Button onClick={() => this.setState({canvasMode: true, selectedShapeName: ''})}>
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

                                        {/* <Button onClick={this.startDownload}>
                                        </Button> */}


                                        <Button onClick={() => this.setState({canvasMode: false, mode:"draw"})}>
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
                        onContextMenu={this.state.permission? this.handleStageContextMenu : this.handleNoPermission}
                        onMouseDown={this.state.permission? this.handleStageMouseDown : this.handleNoPermission}
                    >
                        <Layer hitGraphEnabled={!this.state.canvasMode}>
                            {this.state.objects.map((obj, i) => {
                                if (obj === undefined) console.log(obj)
                                else if (obj.type === "rectangle") {
                                    return <Rectangle 
                                                key={obj.name} 
                                                {...obj}
                                                onDragEnd={e => this.handleDragEnd(obj.name, e.target._lastPos)}
                                                onTransformEnd={e => this.handleTransformEnd(obj.name, e.target.attrs)}
                                            />
                                }
                                else if (obj.type === "text")
                                    return <Text 
                                                key={obj.name} 
                                                {...obj} 
                                                lineHeight= {1.2}
                                                draggable 
                                                onDblClick={e => this.handleEditText(e, obj)}
                                                onDragEnd={e => this.handleDragEnd(obj.name, e.target._lastPos)}
                                                onTransformEnd={e => this.handleTransformEnd(obj.name, e.target.attrs)}
                                            />
                                else if (obj.type === "image") 
                                    return <Image 
                                                key={obj.name} 
                                                {...obj} 
                                                onDragEnd={e => this.handleDragEnd(obj.name, e.target._lastPos)} 
                                                onTransformEnd={e => this.handleTransformEnd(obj.name, e.target.attrs)}
                                                draggable
                                            />
                                return null
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

                        <Layer 
                            hitGraphEnabled={this.state.canvasMode}>
                            <CanvasInsideWhiteboard 
                                key="whiteboard"
                                lineColor={ this.state.lineColor }
                                lineWidth={ this.state.lineWidth }
                                mode={ this.state.mode }
                                startDownload={ this.state.startDownload }
                                linesReceived={this.state.canvasReceived}
                                erasedLines={this.state.erasedLines}
                                user={this.props.user}
                            />
                        </Layer>
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
