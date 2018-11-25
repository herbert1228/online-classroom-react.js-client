import React from 'react';
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import 'whatwg-fetch'

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
        const { classes } = this.props;
        return (
            <main className={classes.content}>
                <div className={classes.toolbar}/>
                <Typography variant="display3"  noWrap>
                    Welcome to the classroom !
                </Typography>
                <Typography noWrap>
                    Currently only Classroom Page (First Icon) and ClassList Page (Second Icon) is not empty.
                </Typography>
            </main>
        )
    }
}

Content.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Content);