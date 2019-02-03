import React, { Component } from 'react'
import { connection as conn } from '../../interface/connection'
import {store} from '../../index'
import {withCookies} from 'react-cookie'
import {compose} from 'redux'
import {Avatar, withStyles, List, ListItem, ListItemText, Menu, MenuItem} from '@material-ui/core'

const styles = theme => ({
    avatar: {
        backgroundColor: "rgba(50,70,60,0.5)"
    },
})

class UserSettings extends Component {
    state = {
        anchorEl: null,
    }

    handleClickListItem = event => {
        this.setState({ anchorEl: event.currentTarget })
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
        const {classes} = this.props
        return (
            <div>
                <List>
                    <ListItem
                        button
                        aria-haspopup="true"
                        aria-controls="lock-menu"
                        aria-label="setting menu"
                        onClick={this.handleClickListItem}
                    >
                        <Avatar aria-label="user whiteboard" className={classes.avatar}>
                            {/* {this.props.self.substring(0, 3)} */}
                            HB
                        </Avatar>
                        <ListItemText
                        // primary={this.props.self}
                        primary="Herbert"
                        secondary="User Settings"
                        />
                    </ListItem>
                </List>
                <Menu
                id="lock-menu"
                anchorEl={this.state.anchorEl}
                open={Boolean(this.state.anchorEl)}
                onClose={this.handleClose}
                style={{marginLeft: 150}}
                >
                    <MenuItem onClick={this.handleLogout}>
                        Logout
                    </MenuItem>
                </Menu>
            </div>
        )
    }
}

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
)(UserSettings)