import React, { Component } from 'react'
import { withStyles } from '@material-ui/core'
import {Rnd} from 'react-rnd'
import UserCardSmall from '../Content_Components/UserCardSmall'
import { Grid } from '@material-ui/core'

const styles = theme => ({
    grid_item: {
        marginBottom: 50,
    },
    participantList : {
        padding: 20,
        backgroundColor: "rgba(15,25,30,0.15)",
        borderRadius: 25
    }
})

class ParticipantList extends Component {
    render() {
        const { classes, ...other } = this.props
        return (
            <Rnd 
                style={{zIndex: this.props.zIndex}} 
                onMouseDown={() => this.props.bringTop()}
                onDragStart={() => this.props.bringTop()}
                default={this.props.position} enableResizing={false}>
                <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="flex-start"
                    className={classes.participantList}
                >
                    <Grid key={"Member List"} item className={classes.grid_item}>
                        Participants: 
                    </Grid>
                    {this.props.session_user &&
                        this.props.session_user.map(user => (
                            (user !== this.props.self) &&
                            <Grid key={user} item className={classes.grid_item}>
                                <UserCardSmall {...other} user={user} />
                            </Grid>
                        ))}
                </Grid>
            </Rnd>
        )
    }
}

export default withStyles(styles)(ParticipantList)