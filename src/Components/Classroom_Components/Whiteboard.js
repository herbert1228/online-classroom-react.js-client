import React from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Divider, Button} from '@material-ui/core'
import RndContainer from '../Classroom_Components/RndContainer'
import {Stage, Layer, Text, Image} from 'react-konva'
import Rectangle from './Whiteboard_Components/Rectangle'
import TransformerComponent from './Whiteboard_Components/TransformerComponent'
import CanvasInsideWhiteboard from './Whiteboard_Components/CanvasInsideWhiteboard'
import Portal from './Whiteboard_Components/Portal'
import yoda from '../../css/yoda.jpg'


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
    }
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
        cursor: {
            x: null,
            y: null
        },
        image: null,
    }

    componentDidMount(){
        const image = document.createElement("IMG")
        image.src = 'https://konvajs.github.io/assets/yoda.jpg'
        image.height = 100
        image.width = 100
        this.setState({image})
        console.log(image)
        // console.log(this.stage.getContainer())
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
    
    handleMouseMove = e => {
        // first is
        var stage = e.currentTarget;
    
        // or this:
        stage = this.stageRef.getStage();
    
        // or event this:
        stage = e.target.getStage();
        this.setState({
          cursor: stage.getPointerPosition()
        });
        console.log(this.state.cursor)
    };

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
                        {/* <img src={yoda} id="yoda" draggable="true"/> */}
                        
                    </div>
                    <Divider/>
                    <Stage width={800} height={600} 
                        onMouseDown={this.handleStageMouseDown}
                        onMouseMove={this.handleMouseMove}
                        onDragMove = { () => {console.log("aaa")}}
                        ref={ref => {
                            this.stageRef = ref;
                          }}>
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
                            <CanvasInsideWhiteboard/>
                            {/* <Image
                                image = {this.state.image}
                            /> */}
                            
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