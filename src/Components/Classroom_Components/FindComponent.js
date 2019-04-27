import PopoverNarrow from '../PopoverNarrow'
import React, { Fragment } from 'react';
import {withStyles} from '@material-ui/core/styles'
import { DialogContent, IconButton, Button, ListItem, ListItemText, Collapse, ListItemIcon } from "@material-ui/core";
import { FindInPage, List, ExpandLess, ExpandMore, StarBorder } from '@material-ui/icons';
import NestedListInFind from '../NestedListInFind';

const styles = theme => ({
    listRoot: {
        width: '100%',
        // maxWidth: ,
        backgroundColor: theme.palette.background.paper,
    },
    nested: {
        paddingLeft: theme.spacing.unit * 4,
    }
})

class FindComponent extends React.Component {
    state = { 
        open: false,
        listOpen: false
    }

    handleClose = () => {
        this.setState({open: false})
    }

    handleOpen = () => {
        this.setState({open: true})
    }

    bringTop = component => {
        this.props.bringTop(component)
        this.handleClose()
    }

    render() { 
        const { classes, components, ...others } = this.props
        return (
            <div style={{flex: 1}}>
                <IconButton aria-label="Find" onClick={this.handleOpen}>
                    <FindInPage/>
                </IconButton>
                <PopoverNarrow title="Find" open={this.state.open} onClose={this.handleClose}>
                <DialogContent>
                    <NestedListInFind components={components} bringTop={this.bringTop}/>
                </DialogContent>
                </PopoverNarrow>
            </div>
        );
    }
}

function hasGroup(groupId, props) {
    return props.groupCards.filter(group => group.status === groupId).length > 0
}

export default withStyles(styles, {withTheme: true})(FindComponent)