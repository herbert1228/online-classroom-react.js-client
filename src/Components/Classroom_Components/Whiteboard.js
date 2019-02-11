import React from 'react';
// import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Avatar, Divider} from '@material-ui/core'
import LocalStream from '../Classroom_Components/LocalStream'
import RemoteStream from '../Classroom_Components/RemoteStream'
import UserCardMenu from '../Classroom_Components/UserCardMenu'
import {Rnd} from 'react-rnd'

const styles = theme => ({
    card: {
        width: '100%',
        height: '100%'
    },
    avatar: {
        backgroundColor: "#769da8"
    }
})

class Whiteboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawRight: 'Read Only',
            camOpen: true
        }
    }

    render() {
        const {classes, ...other} = this.props;
        return (
            <Rnd 
                style={{zIndex: this.props.zIndex}} 
                onMouseDown={() => this.props.bringTop()}
                onDragStart={() => this.props.bringTop()}
                lockAspectRatio={4/3}
                lockAspectRatioExtraHeight={72}
                bounds="window"
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
                        // subheader={this.state.drawRight}
                    />
                    <Divider/>
                    <canvas></canvas>
                </Card>
            </Rnd>
        )
    }
}

export default withStyles(styles)(Whiteboard);