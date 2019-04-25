import React, { Component } from 'react'
import { withStyles } from '@material-ui/core'
import UserCardSmall from '../Content_Components/UserCardSmall'
import { Grid } from '@material-ui/core'
import RndContainer from './RndContainer';
import ManageGroup from './GroupingMenu/ManageGroup';

const styles = theme => ({
    grid_item: {
        marginBottom: 25,
    },
    participantList : {
        padding: 20,
        backgroundColor: "rgba(15,25,30,0.15)",
        borderRadius: 25,
        width: 137
    }
})

class ParticipantList extends Component {
    render() {
        const { classes, ...other } = this.props
        return (
            <RndContainer {...other}>
                <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="flex-start"
                    className={classes.participantList}
                >
                    <Grid item className={classes.grid_item}>
                        <ManageGroup {...other}/>
                    </Grid>
                    <Grid key={"Member List"} item className={classes.grid_item}>
                        Students: 
                    </Grid>
                    {this.props.session_user &&
                        this.props.session_user.map(user => (
                            (user !== this.props.self) &&
                            (user !== this.props.joined.owner) &&
                            <Grid key={user} item className={classes.grid_item}>
                                <UserCardSmall {...other} user={user} />
                            </Grid>
                        ))}
                </Grid>
            </RndContainer>
        )
    }
}

export default withStyles(styles)(ParticipantList)