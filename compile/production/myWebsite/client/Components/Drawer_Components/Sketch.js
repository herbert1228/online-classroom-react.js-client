import React, {Fragment} from 'react';
import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import StarIcon from '@material-ui/icons/Star';
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
                        <StarIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Sketch"/>
                </ListItem>

                <Popover open={this.state.open} onClose={this.handle.bind(this)} title="Sketch">TestingSketch</Popover>
            </Fragment>
        )
    }
}
