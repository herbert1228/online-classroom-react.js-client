import React, {Fragment} from 'react';
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import SendIcon from '@material-ui/icons/Send';
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
                        <SendIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Locker"/>
                </ListItem>

                <Popover open={this.state.open} onClose={this.handle.bind(this)} title="Locker">Testing Locker</Popover>
            </Fragment>
        )
    }
}
