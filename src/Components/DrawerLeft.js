import React from 'react';
import PropTypes from 'prop-types'
import {Divider, Drawer, withStyles} from '@material-ui/core'
import {ListItems} from './Drawer_Components/DrawerLeftList';
import classNames from 'classnames'
import {drawerWidth} from "./index";
import { connection as conn } from '../interface/connection'
import {store} from '../index'
import {withCookies} from 'react-cookie'
import {compose} from 'redux'
import UserSettings from './Drawer_Components/UserSettings';

const styles = theme => ({
    drawerPaperLeft: {
        position: 'fixed',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        background: "rgba(30,30,30,0.15)"
    },
    toolbar: {
        display: 'flex',
        alignItems: 'left',
        justifyContent: 'flex-start',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    avatar: {
        backgroundColor: "rgba(50,70,60,0.5)"
    },
})

class DrawerLeft extends React.Component {
    state = {
        anchorEl: null,
        selectedIndex: 1,
    }

    handleClickListItem = event => {
        this.setState({ anchorEl: event.currentTarget })
    }
    
    handleMenuItemClick = (event, index) => {
        this.setState({ selectedIndex: index, anchorEl: null })
    }

    handleClose = () => {
        this.setState({ anchorEl: null })
    }

    handleLogout = async () => {
        const result = await conn.call("logout")
        if (result.type !== "ok") throw new Error("invalid_logout")
        this.props.cookies.remove("name")
        this.props.cookies.remove("password")
        store.dispatch({type: "logout"})
    }
    
    render() {
        const {classes, open, ...other} = this.props //, ...others

        return (
            <Drawer
                variant="permanent"
                classes={{
                    paper: classNames(classes.drawerPaperLeft),
                }}
                open={open}
            >
                <UserSettings {...other}/>
                <Divider/>
                <ListItems 
                    changeScene={this.props.changeScene} 
                    location={this.props.location}/>
            </Drawer>
        )
    }
}

DrawerLeft.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
)(DrawerLeft)