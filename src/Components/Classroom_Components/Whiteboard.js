import React from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Divider} from '@material-ui/core'
import {Rnd} from 'react-rnd'
import {Stage, Layer, Text} from 'react-konva'
import Rectangle from './Whiteboard_Components/Rectangle'
import TransformerComponent from './Whiteboard_Components/TransformerComponent'
import Portal from './Whiteboard_Components/Portal'

const styles = theme => ({
    card: {
        width: '100%',
        height: '100%'
    },
    avatar: {
        backgroundColor: "#769da8"
    },
    stage: {height: '460', width: '470'}
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
        selectedShapeName: ''
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

    render() {
        const {classes} = this.props;
        return (
            <Rnd 
                style={{zIndex: this.props.zIndex}} 
                onMouseDown={() => this.props.bringTop()}
                onDragStart={() => this.props.bringTop()}
                lockAspectRatio={4/3}
                lockAspectRatioExtraHeight={72}
                bounds="window"
                enableResizing={false}
                minWidth={200}
                dragHandleClassName={
                    document.getElementById(`draggableWhiteboard${this.props.user}`)?
                    document.getElementById(`draggableWhiteboard${this.props.user}`).className : null
                }
                default={{
                    x: this.props.position.x, 
                    y: this.props.position.y, 
                    width: 460, height: 470
                }}>
                <Card className={classes.card}>
                    <CardHeader //this height is 74px
                        title="Whiteboard"
                        subheader="Teacher"
                        id={`draggableWhiteboard${this.props.user}`}
                        style={{height: 50}}
                    />
                    <Divider/>
                    <Stage width={460} height={398} 
                        onDragOver={() => console.log("onDragOver")} //!!! e.preventDefault()
                        onDrop={() => console.log("onDrop")} // e.preventDefault() then add image at pointer position
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
            </Rnd>
        )
    }
}

export default withStyles(styles)(Whiteboard);