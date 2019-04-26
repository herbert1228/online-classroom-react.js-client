import React, { Component, Fragment } from 'react'
import { withStyles } from '@material-ui/core'
import UserCardSmall from '../Content_Components/UserCardSmall'
import { Grid, Button } from '@material-ui/core'
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
    state = {
        open: false,
    }

    handleOpenGroupingMenu = async () => {
        this.setState({open: true})
        // const response = await conn.call("get_student_names_of_a_class", c)
        // if (response.result) {
        //     if (response.result.subed.length <= 1) {
        //         this.props.handleNotification(`No one enrolled ${c.class_name} yet`)
        //         return
        //     }
        //     this.setState({
        //         open: true, 
        //         subed: response.result.subed, 
        //         joined: response.result.joined})
        // }
    }

    render() {
        const { classes, ...other } = this.props
        return (
            <Fragment>
                <ManageGroup {...other} open={this.state.open} onClose={()=>this.setState({open: false})}/>
                <RndContainer {...other}>
                    <Grid
                        container
                        direction="column"
                        justify="flex-start"
                        alignItems="flex-start"
                        className={classes.participantList}
                    >
                        {isTeacher(this.props) &&
                            <Grid item className={classes.grid_item}>
                                <Button variant="outlined" onClick={this.handleOpenGroupingMenu}>
                                    Groups
                                </Button>
                            </Grid>
                        }
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
            </Fragment>
        )
    }
}

function isTeacher(props) {
    return props.joined.owner === props.self
}

export default withStyles(styles)(ParticipantList)