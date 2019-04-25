import React, {Fragment} from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Button } from '@material-ui/core'
import JoinedLayoutStudent from '../Classroom_Components/JoinedLayoutStudent'
import JoinedLayoutTeacher from '../Classroom_Components/JoinedLayoutTeacher'
import {connection as conn} from '../../interface/connection'
import {store} from '../../index'

const styles = theme => ({
    notJoined: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-55%) translateY(-60%)',
        textAlign: 'center',
        display: 'flex', 
        justifyContent: 'space-around',
        flexDirection: 'column',
    },
    notJoinHeading: {
        // marginBottom: '20px'
    }
})

class Classroom extends React.Component {
    async joinClass(owner, class_name) {
        const response = await conn.call("join_class", {owner, class_name})
        if (response.type === "ok") {
            const s_user = await conn.call("get_session_user")
            store.dispatch({
                type: "get_session_user",
                result: s_user.result
            })
            store.dispatch({type: "joinClass", owner, class_name: class_name})
            // this.props.handleNotification(`join ${owner}'s class: ${class_name} success`)
        }
        if (response.type === "reject") {
            this.props.handleNotification(`join class failed, reason: ${response.reason}`)
        }
    }

    render() {
        const { classes, ...other } = this.props
        return (
            <Fragment>
                {(this.props.joined === null) && 
                    <div className={classes.notJoined}>
                        <Typography variant="headline" gutterBottom >
                            Not joined a classroom yet
                        </Typography>
                        <div style={{display: 'flex', justifyContent: 'space-around'}}>
                            <Button 
                                onClick={() => this.props.changeScene(2.2)}
                                size="small">
                                Learn here!
                            </Button>
                            <Button 
                                onClick={() => this.props.changeScene(2.1)}
                                size="small">
                                Teach here!
                            </Button>
                        </div>
                        {this.props.lastJoin && 
                            <div style={{height: 20}}></div>
                        }
                        {this.props.lastJoin && 
                            <Typography variant="subheading">Or join where you left last time:</Typography>
                        }
                        {this.props.lastJoin &&
                            <Fragment>
                                <Button 
                                    onClick={() => this.joinClass(this.props.lastJoin.owner, this.props.lastJoin.class_name)}
                                    size="small">
                                    Class: {this.props.lastJoin.owner} Teacher: {this.props.lastJoin.owner}
                                </Button>
                            </Fragment>
                        }
                    </div>
                }
                {(this.props.joined) && (this.props.joined.owner !== this.props.self) &&
                   <JoinedLayoutStudent {...other}/>
                }
                {(this.props.joined) && (this.props.joined.owner === this.props.self) &&
                   <JoinedLayoutTeacher {...other}/>
                }
            </Fragment>
        )
    }
}

Classroom.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Classroom)