import React, {Fragment} from 'react';
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import DraftsIcon from '@material-ui/icons/Drafts';
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
                        <DraftsIcon/>
                    </ListItemIcon>
                    <ListItemText primary="History"/>
                </ListItem>

                <Popover open={this.state.open} onClose={this.handle.bind(this)} title="History">
                    {/*Testing History*/}
                </Popover>
            </Fragment>
        )
    }
}
