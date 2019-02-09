import React, { Component } from 'react'
import { Grid, AppBar, Toolbar, Typography } from '@material-ui/core'
import {Rnd} from 'react-rnd'
import UserCard from '../Content_Components/UserCard'
import UserCardSmall from '../Content_Components/UserCardSmall'
import ClassMenu from '../Classroom_Components/ClassMenu'
import { withStyles } from '@material-ui/core/styles'

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

class JoinedLayout extends Component {
    render() {
        const { classes, ...other } = this.props
        return (
            <div>
                <AppBar position="static" color="default">
                    <Toolbar variant="dense">
                        <Typography variant="h6">{this.props.joined.class_name}</Typography>
                        <ClassMenu {...other} />
                    </Toolbar>
                </AppBar>
                <Rnd default={{y: 50, x: 0}} enableResizing={false}>
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
                        {(this.props.session_user != null) &&
                            this.props.session_user.map(user => (
                                (user !== this.props.self) &&
                                <Grid key={user} item className={classes.grid_item}>
                                    <UserCardSmall {...other} user={user} />
                                </Grid>
                            ))}
                    </Grid>
                </Rnd>
                <UserCard 
                    key={"Teacher"} 
                    {...other} 
                    user={"Teacher"}
                    position={{x: 200, y: 100}} />                    
                <UserCard 
                    position={{x: 800, y: 100}}
                    key={this.props.self} {...other} 
                    user={this.props.self} />
            </div>
        )
    }
}

export default withStyles(styles)(JoinedLayout)