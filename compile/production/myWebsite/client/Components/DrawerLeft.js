import React from 'react';
import PropTypes from 'prop-types'
import {Divider, Drawer, IconButton, List, withStyles} from '@material-ui/core'
import {ChevronLeft} from '@material-ui/icons'
import {ListItems1, listItems2} from './Drawer_Components/DrawerLeftList';
import classNames from 'classnames'
import {drawerWidth} from "./index";

const styles = theme => ({
    drawerPaperLeft: {
        position: 'fixed',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing.unit * 7,
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing.unit * 9,
        },
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
});

class DrawerLeft extends React.Component {

    render() {
        const {classes, open} = this.props;

        return (
            <Drawer
                variant="permanent"
                classes={{
                    paper: classNames(classes.drawerPaperLeft, !open && classes.drawerPaperClose),
                }}
                open={open}
            >
                <div className={classes.toolbar}>
                    <IconButton onClick={() => this.props.onClickClose()}>
                        <ChevronLeft/>
                    </IconButton>
                </div>
                <Divider/>
                <ListItems1/>
                <Divider/>
                <List>{listItems2}</List>
            </Drawer>
        )
    }
}

DrawerLeft.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DrawerLeft);