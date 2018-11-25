import React from 'react';
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import {Grid} from '@material-ui/core'
import 'whatwg-fetch'
import UserCard from '../Content_Components/UserCard'


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
        paddingRight: 250,
        paddingLeft: 120,
    },
    grid_item: {
        marginBottom: 50,
    },
    grid: {
        paddingTop: 30,
    }
});

class Content extends React.Component {
    render() {
        const { classes, ...other } = this.props;
        return (
            <main className={classes.content}>
                <div className={classes.toolbar}/>
                <Typography noWrap>{'Mailbox'}</Typography>
                <Grid
                    container
                    direction="row"
                    justify="space-around"
                    alignItems="flex-start"
                    className={classes.grid}
                >
                    {(this.props.users != null) && this.props.users.map(user => (
                        <Grid key={user.name} item className={classes.grid_item}>
                            <UserCard {...other} user={user}/>
                        </Grid>
                    ))}
                </Grid>
            </main>
        )
    }
}

Content.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Content);