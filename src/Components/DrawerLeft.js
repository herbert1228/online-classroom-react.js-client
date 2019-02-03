import React from 'react';
import PropTypes from 'prop-types'
import {Divider, Drawer, withStyles, List} from '@material-ui/core'
import {ListItems1, listItems2} from './Drawer_Components/DrawerLeftList'
import UserSettings from './Drawer_Components/UserSettings'
import classNames from 'classnames'
import {drawerWidth} from "./index"

const styles = theme => ({
    drawerPaperLeft: {
        position: 'fixed',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        background: "rgba(30,30,30,0.15)"
    },
    toolbar: {
        display: 'flex',
        alignItems: 'left',
        justifyContent: 'flex-start',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    }
})

class DrawerLeft extends React.Component {
    render() {
        const {classes, open, ...others} = this.props 

        return (
            <Drawer
                variant="permanent"
                classes={{paper: classNames(classes.drawerPaperLeft),}}
                open={open}
            >
                <UserSettings {...others}/>
                <Divider/>
                <ListItems1 changeScene={this.props.changeScene} location={this.props.location}/>
                <Divider/>
                <List>{listItems2}</List>
            </Drawer>
        )
    }
}

DrawerLeft.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles, {withTheme: true})(DrawerLeft)