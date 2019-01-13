import React from 'react';
// import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Avatar, Divider} from '@material-ui/core'
import { Pencil, TOOL_PENCIL } from "./tools";
import LocalStream from '../Classroom_Components/LocalStream'
import RemoteStream from '../Classroom_Components/RemoteStream'
import UserCardMenu from '../Classroom_Components/UserCardMenu'
// import { findDOMNode } from 'react-dom'

const styles = theme => ({
    card: {
        width: 460,
        height: 633
    },
    avatar: {
        backgroundColor: "#769da8"
    },
    canvas: {
        // height: `calc(100% - 74px)`,
        // width: '100%',
    },
});

const toolsMap = {
    [TOOL_PENCIL]: Pencil,
};

class UserCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tool: toolsMap[TOOL_PENCIL](this.ctx), //props.tool: tool name that will be mapped and converted to tool function
            color: '#000',
            size: 5,
            fillColor: '',
            debounceTime: 1000,
            animate: true,
            toolsMap,
            self: null,
            drawRight: 'Read Only',
            camOpen: true
        };
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    componentDidMount() {
        // // this.canvas = findDOMNode(this.canvasRef);
        // this.canvas = document.getElementById(this.props.user + "-canvas");
        // this.ctx = this.canvas.getContext('2d');
        // this.setState({tool: toolsMap[TOOL_PENCIL](this.ctx)});
        // // this.drawCanvas(this.props.user, true)
        // let item = this.props.user.whiteboard;
        // let i = 0;
        // if (item.length !== 0) {
        //     item.forEach( (line) => {
        //         const j = line.points.length;
        //         for (i, j; i < j; i++) {
        //             if (!line.points[i - 1]) continue;
        //             this.ctx.lineJoin = 'round';
        //             this.ctx.lineCap = 'round';
        //             this.ctx.beginPath();
        //             this.ctx.lineWidth = line.size;
        //             this.ctx.strokeStyle = line.color;
        //             this.ctx.globalCompositeOperation = 'source-over'; //or 'destination-over'
        //             this.ctx.moveTo(line.points[i - 1].x, line.points[i - 1].y);
        //             this.ctx.lineTo(line.points[i].x, line.points[i].y);
        //             this.ctx.closePath();
        //             this.ctx.stroke();
        //         }
        //     });
        //
        // }
    }
    //
    // componentWillReceiveProps({user, self}){
    //     // if (self !== this.state.self || this.state.self === null) {
    //     if (self !== this.props.user) {
    //         // console.log("Im "+self+", geting draw from "+user.name)
    //         this.drawCanvas(user, true)
    //     } //else {console.log("I: "+self+" am the owner")}
    //     if (this.state.self === null){
    //         this.setState({self: self, drawRight: 'self'}, function () {
    //             // console.log("Im "+this.state.self+" now")
    //         });
    //     }
    // }

    drawCanvas(u, animated){
        u.whiteboard.forEach(stroke => {
            this.state.tool.draw(stroke, animated);
        })
    }

    onMouseDown(e) {
        if (this.state.self === this.props.user.name) {
            console.log(this.state.self + "is drawing" + this.props.user.name + "-canvas")
            this.state.tool.onMouseDown(
                ...this.getMousePosition(e),
                this.state.color,
                this.state.size,
                this.state.fillColor
            );
        }
    }

    onMouseMove(e) {
        if (this.state.self === this.props.user.name) {
            this.state.tool.onMouseMove(...this.getMousePosition(e));
            // const data = this.state.tool.onMouseMove(...this.getMousePosition(e));
        }
    }

    onMouseUp(e) {
        if (this.state.self === this.props.user.name) {
            const data = this.state.tool.onMouseUp(...this.getMousePosition(e));
            if (data !== undefined) {
                let message = {
                    name: 'draw',
                    data: {
                        tool: data.tool,
                        color: data.color,
                        size: data.size,
                        points: data.points,
                        id: data.id
                    }
                };
                this.props.ws.send(JSON.stringify(message));
            }
        }
    }

    getMousePosition(e) {
        const {top, left} = this.canvas.getBoundingClientRect();
        return [
            e.clientX - left,
            e.clientY - top
        ];
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