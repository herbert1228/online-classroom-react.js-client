import React, {Fragment} from 'react';
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import SAIcon from '@material-ui/icons/SupervisorAccount';
import Popover from '../Popover'

export default class extends React.Component {
    state = {open: false};

    handle() {
        this.setState({open: !this.state.open});
    }

    render() {
        return (
            <Fragment>
                <ListItem button onClick={() => this.handle()} selected={this.props.location === 1}>
                    <ListItemIcon>
                        <SAIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Whiteboard"/>
                </ListItem>

                <Popover open={this.state.open} onClose={this.handle.bind(this)} title="Whiteboard">Testing Whiteboard</Popover>
            </Fragment>
        )
    }
}