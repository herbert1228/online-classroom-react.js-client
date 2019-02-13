import React from 'react';
// import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Avatar, Divider} from '@material-ui/core'
import LocalStream from '../Classroom_Components/LocalStream'
import RemoteStream from '../Classroom_Components/RemoteStream'
import UserCardMenu from '../Classroom_Components/UserCardMenu'
import RndContainer from '../Classroom_Components/RndContainer'

const styles = theme => ({
    card: {
        width: '100%',
        height: '100%'
    },
    avatar: {
        backgroundColor: "#769da8"
    }
})

class UserCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawRight: 'Read Only',
            camOpen: true
        }
    }

    disableWebcam() {
        this.setState({camOpen: false})
    }

    render() {
        const {user} = this.props;
        const {classes, ...other} = this.props;
        return (
            <RndContainer {...other}>
                <Card className={classes.card}>
                    <CardHeader //this height is 74px
                        id={`draggable${this.props.id}`}
                        avatar={
                            <Avatar aria-label="user whiteboard" className={classes.avatar}>
                                {user.substring(0, 3)}
                            </Avatar>
                        }
                        action={
                            <UserCardMenu disableWebcam={this.disableWebcam.bind(this)}/>
                        }
                        title={`${user}'s Webcam`}
                        // subheader={this.state.drawRight}
                    />
                    <Divider/>
                    <Webcam {...other} camOpen={this.state.camOpen} />
                </Card>
            </RndContainer>
        )
    }
}

function Webcam(props) {
    const {self, user} = props
    if (user === self) {
        return (
            <LocalStream
                {...props}
            />
        )
    } else {
        return (
            <RemoteStream
                {...props}
            />
        )
    }
}

export default withStyles(styles)(UserCard);