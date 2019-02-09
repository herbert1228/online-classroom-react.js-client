import React, { Component } from 'react'
import { Grid, AppBar, Toolbar, Typography } from '@material-ui/core'
import {Rnd} from 'react-rnd'
import UserCard from '../Content_Components/UserCard'
import UserCardSmall from '../Content_Components/UserCardSmall'
import ClassMenu from '../Classroom_Components/ClassMenu'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
    root: {
        position: "relative",
    },
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
    state = {
        rndSelf: {
            size: {width: 460, height: 633},
            position: {x: 800, y: 100}
        },
        rndTeacher: {
            size: {width: 460, height: 633},
            position: {x: 200, y: 100}
        }
    }
    render() {
        const { classes, ...other } = this.props
        return (
            <div className={classes.root}>
                <AppBar position="static" color="default">
                    <Toolbar variant="dense">
                        <Typography variant="h6">{this.props.joined.class_name}</Typography>
                        <ClassMenu {...other} />
                    </Toolbar>
                </AppBar>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={40}
                >
                    <Grid item>
                        <Grid
                            container
                            direction="column"
                            justify="center"
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
                    </Grid>
                </Grid>
                <Rnd key={"Teacher"}
                    size={this.state.rndTeacher.size}
                    position={this.state.rndTeacher.position}
                    onDragStop={(e, d) => this.setState({
                        rndTeacher: {
                            ...this.state.rndTeacher, 
                            position: {x: d.x, y: d.y}
                        }})}
                    onResize={(e, direction, ref, delta, position) => this.setState({
                        rndTeacher: {
                            ...this.state.rndTeacher, 
                            size: {width: ref.style.width, height: ref.style.height},
                            position
                        }})}>
                    <UserCard {...other} user={"Teacher"} />                    
                </Rnd>
                <Rnd key={this.props.self} 
                    size={this.state.rndSelf.size}
                    position={this.state.rndSelf.position}
                    onDragStop={(e, d)=>this.setState({
                        rndSelf: {
                            ...this.state.rndSelf, 
                            position: {x: d.x, y: d.y}
                        }})}
                    onResize={(e, direction, ref, delta, position) => this.setState({
                        rndSelf: {
                            ...this.state.rndSelf, 
                            size: {width: ref.style.width, height: ref.style.height},
                            position
                        }})}>
                    <UserCard {...other} user={this.props.self} />
                </Rnd>
            </div>
        )
    }
}

export default withStyles(styles)(JoinedLayout)