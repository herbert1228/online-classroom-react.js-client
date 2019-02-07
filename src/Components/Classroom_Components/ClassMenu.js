import React from 'react';
import {Button, Menu, MenuItem} from '@material-ui/core'
import Leave from '@material-ui/icons/DirectionsRun'
import {withStyles} from '@material-ui/core/styles'
import { connection as conn } from '../../interface/connection';
import { store } from '../..';

const styles = theme => ({
    menu: {
        position: "fixed",
        top: 90,
        right: 10
    }
})

class ClassMenu extends React.Component {
    state = {
        anchorEl: null,
    }

    async leave() {
        this.handleClose()
        const response = await conn.call("leave_class")
        if (response.type === "ok") {
            store.dispatch({type: "leaveClass"})
            this.props.changeScene(1)
            this.props.handleNotification("leave_class success")
            // this.setState({session_user: [], joined: null}) //TODO 
        } else throw new Error("invalid action: leave class")
    }

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget })
    }

    handleClose = () => {
        this.setState({ anchorEl: null })
    }

    render() {
        const { anchorEl } = this.state;
        const { classes } = this.props;

        return (
            <div className={classes.menu}>
                <Button
                    aria-owns={anchorEl ? 'simple-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClick}
                >
                    Class: {this.props.joined.class_name},
                    Teacher: {this.props.joined.owner}
                    {/*joined: {this.props.session_user.map(user => user + ", ")}*/}
                </Button>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                >
                    <MenuItem onClick={this.leave.bind(this)}>
                        <Leave/>
                    </MenuItem>
                    {/*<MenuItem onClick={this.handleClose}>My account</MenuItem>*/}
                    {/*<MenuItem onClick={this.handleClose}>Logout</MenuItem>*/}
                </Menu>
            </div>
        )
    }
}

export default withStyles(styles)(ClassMenu);