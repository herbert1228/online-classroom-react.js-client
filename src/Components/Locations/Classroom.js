import React from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Grid, Button } from '@material-ui/core'
import 'whatwg-fetch'
import UserCard from '../Content_Components/UserCard'
import UserCardSmall from '../Content_Components/UserCardSmall'
import ClassMenu from '../Classroom_Components/ClassMenu'

const styles = theme => ({
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 5,
        minWidth: 0, // So the Typography noWrap works
        paddingRight: 45,
        paddingLeft: 100,
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

class Classroom extends React.Component {
    render() {
        const { classes, ...other } = this.props

        return (
            <main className={classes.content}>
                <div className={classes.toolbar} />
                {(this.props.joined == null) && <Typography variant="headline" gutterBottom>Not joined a classroom yet</Typography>}
                {(this.props.joined == null) &&
                    <Button
                        onClick={() => this.props.changeScene(2)}
                        size="small"
                    >Select a classroom here!</Button>
                }
                {(this.props.joined != null) &&
                    <ClassMenu {...other} />
                }
                {(this.props.joined != null) &&
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                        // className={classes.grid}
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

                        <Grid key={"Teacher"} item className={classes.grid_item}>
                            <UserCard {...other} user={"Teacher"} />
                        </Grid>

                        <Grid key={this.props.self} item className={classes.grid_item}>
                            <UserCard {...other} user={this.props.self} />
                        </Grid>
                    </Grid>
                }
            </main>
        )
    }
}

Classroom.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Classroom);