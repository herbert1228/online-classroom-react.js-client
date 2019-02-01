import React from 'react';
import {AppBar, IconButton, Toolbar, Typography, Button} from "@material-ui/core";
import PropTypes from 'prop-types'
import classNames from 'classnames'
import {withStyles} from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'
import {drawerWidth} from "./index";

const styles = theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        position: 'fixed',
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
    },
    // appBarShift: {
    //     marginLeft: drawerWidth,
    //     width: `calc(100% - ${drawerWidth}px)`,
    //     transition: theme.transitions.create(['width', 'margin'], {
    //         easing: theme.transitions.easing.sharp,
    //         duration: theme.transitions.duration.enteringScreen,
    //     }),
    // },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    flex: {
        flex: 1
    },
    hide: {
        display: 'none',
    },
});


class Header extends React.Component {
    logout() {
        this.props.ws.send(JSON.stringify({type:"logout"}))
    }

    render() {
        const {classes, open} = this.props;
        return (
            <AppBar position="absolute" color="primary"
                    className={classNames(classes.appBar)}
            >
                <Toolbar>
                    <IconButton
                        className={classNames(classes.menuButton, open && classes.hide)}
                        color="inherit" aria-label="Menu"
                        onClick={() => this.props.onClickOpen()}
                    >
                        <MenuIcon/>
                    </IconButton>
                    <Typography variant="title" color="inherit" className={classes.flex}>
                        Classroom
                    </Typography>
                    <Button color="inherit"
                            onClick={()=> this.logout()}>
                        Hello {this.props.self}, logout here
                    </Button>
                </Toolbar>
            </AppBar>
        )
    }
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(Header);