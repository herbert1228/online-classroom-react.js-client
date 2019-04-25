import React, { Fragment } from 'react';
import {Divider, List} from '@material-ui/core'
import SuperUserIcon from '@material-ui/icons/SupervisorAccount';
import ListIcon from '@material-ui/icons/Subject';
import NoteIcon from '@material-ui/icons/BookmarkBorder';
import MailIcon from '@material-ui/icons/MailOutline';
import InputIcon from '@material-ui/icons/Input';
import ReportIcon from '@material-ui/icons/Report';
import HomeIcon from '@material-ui/icons/Home';
import Redirect from 'react-router-dom/Redirect'
// import {History, Locker, Sketch, Classroom} from './index'

import {ListItem, ListItemIcon, ListItemText} from "@material-ui/core";

export class ListItems extends React.Component {
    state = {redirect: false}
    render() {
        if (this.state.redirect) return (<Redirect to='/upload'/>
        )
        return (
            <Fragment>
                <div style={{paddingTop: 7}}>
                    <ListItem button onClick={() => this.props.changeScene(0)} disabled={this.props.location === 0}>
                        <ListItemIcon>
                            <HomeIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Home"/>
                    </ListItem>
                    <ListItem button onClick={() => this.props.changeScene(1)} disabled={this.props.location === 1}>
                        <ListItemIcon>
                            <SuperUserIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Classroom"/>
                    </ListItem>
                    {/* <ListItem button onClick={() => this.props.changeScene(2)} disabled={this.props.location === 2}>
                        <ListItemIcon>
                            <ListIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Class List"/>
                    </ListItem> */}
                    <ListItem button onClick={() => this.props.changeScene(2.2)} disabled={this.props.location === 2.2}>
                        <ListItemIcon>
                            <ListIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Learn List"/>
                    </ListItem>
                    <ListItem button onClick={() => this.props.changeScene(2.1)} disabled={this.props.location === 2.1}>
                        <ListItemIcon>
                            <ListIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Teach List"/>
                    </ListItem>
                    {/* <ListItem button onClick={() => this.props.changeScene(3)} disabled={this.props.location === 3}>
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
                    </ListItem> */}
                </div>
                <Divider/>
                <List>
                    <ListItem button onClick={() => this.setState({redirect: true})}>
                        <ListItemIcon>
                            <InputIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Upload File"/>
                    </ListItem>
                    {/* <ListItem button>
                        <ListItemIcon>
                            <MailIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Mailbox"/>
                    </ListItem> */}
                    {/* <ListItem button>
                        <ListItemIcon>
                            <ReportIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Notification"/>
                    </ListItem> */}
                </List>
            </Fragment>
        )
    }
}
