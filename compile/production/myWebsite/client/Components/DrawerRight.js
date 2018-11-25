import React from 'react';
import PropTypes from 'prop-types'
import {Tabpage} from "./Drawer_Components";
import {Drawer} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {drawerWidth} from "./index";

const styles = theme => ({
    drawerPaperRight: {
        position: 'fixed',
        right: 0,
        width: drawerWidth,
    },
    toolbar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
});

class DrawerRight extends React.Component {
    render() {
        const {classes, ...others} = this.props;
        return (
            <Drawer
                variant="permanent"
                anchor="right"
                classes={{
                    paperAnchorRight: classes.drawerPaperRight,
                }}
            >
                <div className={classes.toolbar}/>
                <Tabpage {...others}/>
            </Drawer>
        )
    }
}

DrawerRight.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DrawerRight);