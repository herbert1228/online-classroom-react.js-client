import React from 'react';
import SuperUserIcon from '@material-ui/icons/SupervisorAccount';
import ListIcon from '@material-ui/icons/Subject';
import NoteIcon from '@material-ui/icons/BookmarkBorder';
import MailIcon from '@material-ui/icons/MailOutline';
import DeleteIcon from '@material-ui/icons/Delete';
import ReportIcon from '@material-ui/icons/Report';
// import {History, Locker, Sketch, Classroom} from './index'

import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";

export class ListItems1 extends React.Component {
    render() {
        return (
            <div style={{paddingTop: 7}}>
                <ListItem button onClick={() => this.props.changeScene(1)} disabled={this.props.location === 1}>
                    <ListItemIcon>
                        <SuperUserIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Classroom"/>
                </ListItem>
                <ListItem button onClick={() => this.props.changeScene(2)} disabled={this.props.location === 2}>
                    <ListItemIcon>
                        <ListIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Class List"/>
                </ListItem>
                <ListItem button onClick={() => this.props.changeScene(3)} disabled={this.props.location === 3}>
                    <ListItemIcon>
                        <NoteIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Notebooks"/>
                </ListItem>
                <ListItem button onClick={() => this.props.changeScene(4)} disabled={this.props.location === 4}>
                    <ListItemIcon>
                        <MailIcon/>
                    </ListItemIcon>
                    <ListItemText primary="Mailbox"/>
                </ListItem>
            </div>
        )
    }
}

export const listItems2 = (
    <div>
        <ListItem button>
            <ListItemIcon>
                <MailIcon/>
            </ListItemIcon>
            <ListItemText primary="All mail"/>
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <DeleteIcon/>
            </ListItemIcon>
            <ListItemText primary="Trash"/>
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <ReportIcon/>
            </ListItemIcon>
            <ListItemText primary="Spam"/>
        </ListItem>
    </div>
);
