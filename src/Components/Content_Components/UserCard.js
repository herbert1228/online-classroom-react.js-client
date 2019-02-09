import React from 'react';
// import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Avatar, Divider} from '@material-ui/core'
import LocalStream from '../Classroom_Components/LocalStream'
import RemoteStream from '../Classroom_Components/RemoteStream'
import UserCardMenu from '../Classroom_Components/UserCardMenu'
// import { findDOMNode } from 'react-dom'
// import PaintEditor from 'scratch-paint';

const styles = theme => ({
    card: {
        width: '100%',
        height: '100%'
    },
    avatar: {
        backgroundColor: "#769da8"
    },
});


class UserCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            color: '#000',
            size: 5,
            fillColor: '',
            debounceTime: 1000,
            animate: true,
            self: null,
            drawRight: 'Read Only',
            camOpen: true
        };
    }

    disableWebcam() {
        this.setState({camOpen: false})
    }

    render() {
        const {user} = this.props;
        const {classes, ...other} = this.props;
        return (
            <Card className={classes.card}>
                <CardHeader //this height is 74px
                    avatar={
                        <Avatar aria-label="user whiteboard" className={classes.avatar}>
                            {user.substring(0, 3)}
                        </Avatar>
                    }
                    action={
                        <UserCardMenu disableWebcam={this.disableWebcam.bind(this)}/>
                    }
                    title={user}
                    // subheader={this.state.drawRight}
                />
                <Divider/>
                <Webcam {...other} camOpen={this.state.camOpen} />
                <Divider/>
                <canvas
                    id = {this.props.user + "-canvas"}
                    key = {this.props.user + "-canvas"}
                    // ref = {(canvas) => this.canvasRef = canvas}
                    className={classes.canvas}
                    onMouseDown={this.onMouseDown}
                    onMouseMove={this.onMouseMove}
                    onMouseOut={this.onMouseUp}
                    onMouseUp={this.onMouseUp}
                    width={460}
                    height={259}
                />
            </Card>
        )
    }
}

function Webcam(props) {
    const {self, user} = props
    if (user === self) {
        return (
            <LocalStream
                width={460}
                height={300}
                {...props}
            />
        )
    } else {
        return (
            <RemoteStream
                width={460}
                height={300}
                {...props}
            />
        )
    }
}

export default withStyles(styles)(UserCard);