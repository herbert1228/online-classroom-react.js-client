import React, {Fragment} from 'react';
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import InboxIcon from '@material-ui/icons/MoveToInbox';
import Popover from '../Popover'

export default class extends React.Component {
    state = {open: false};

    handle() {
        this.setState({open: !this.state.open});
    }

    render() {
        return (
            <Fragment>
                <ListItem button onClick={() => this.handle()}>
                    <ListItemIcon>
                        <InboxIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Classroom"/>
                </ListItem>

                <Popover open={this.state.open} onClose={this.handle.bind(this)} title="Classroom">
                    Testing Whiteboard
                </Popover>
            </Fragment>
        )
    }
}