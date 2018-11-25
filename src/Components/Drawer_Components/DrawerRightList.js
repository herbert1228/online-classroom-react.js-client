import React from 'react';
import {ListItem, ListItemIcon, ListItemText} from '@material-ui/core'
import {Inbox} from '@material-ui/icons'

let InboxIcon = Inbox;

export const mainList = (
    <div>
        <ListItem button>
            <ListItemIcon>
                <InboxIcon/>
            </ListItemIcon>
            <ListItemText primary="Inbox"/>
        </ListItem>
        <ListItem button>
            <ListItemIcon>
                <InboxIcon/>
            </ListItemIcon>
            <ListItemText primary="Inbox"/>
        </ListItem>
    </div>
);