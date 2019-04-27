import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import SendIcon from '@material-ui/icons/Send';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';

const styles = theme => ({
  root: {
    width: '100%',
    // maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class NestedList extends React.Component {
    state = {
        open: true,
    }

    handleClick = () => {
        this.setState(state => ({ open: !state.open }));
    }

    render() {
        const { classes, components } = this.props

        return (
            <List
                component="nav"
                subheader={<ListSubheader component="div">Classroom Components</ListSubheader>}
                className={classes.root}
            >
                {Object.keys(components).map(
                    (outer) => (
                        <Fragment key={outer}>
                            <ListItem button onClick={this.handleClick}>
                                <ListItemIcon>
                                <InboxIcon />
                                </ListItemIcon>
                                <ListItemText inset primary={outer} />
                                {this.state.open ? <ExpandLess /> : <ExpandMore />}
                            </ListItem>
                        {Object.keys(components[outer]).map((inner) => (
                            <Fragment key={inner}>                    
                                <Collapse in={this.state.open} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding>
                                    <ListItem button className={classes.nested} onClick={()=>this.props.bringTop(inner)}>
                                        <ListItemIcon>
                                        <StarBorder />
                                        </ListItemIcon>
                                        <ListItemText inset primary={getInnerName(inner, outer)} />
                                    </ListItem>
                                    </List>
                                </Collapse>
                            </Fragment>
                        ))}
                    </Fragment>)
                )}
            </List>
        )
    }
}

function getInnerName(inner, outer) {
    if (outer === 'webcam') return inner.substring(0, inner.length - 6)
    if (outer === 'whiteboard') return inner.substring(0, inner.length - 10)
    if (outer === 'drawer') return inner.substring(0, inner.length - 6)
    // if (outer === 'other') return inner.substring(0, inner.length - 4)
    return inner
}

NestedList.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NestedList);