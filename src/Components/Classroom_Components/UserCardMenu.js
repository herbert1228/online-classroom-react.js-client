import React from 'react';
import {Menu, MenuItem, IconButton} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {MoreVert} from '@material-ui/icons'

const styles = theme => ({

})

class ClassMenu extends React.Component {
    state = {
        anchorEl: null,
    }

    handleClick = event => {
        this.setState({ anchorEl: event.currentTarget })
    }

    handleClose = () => {
        this.setState({ anchorEl: null })
    }

    render() {
        const { anchorEl } = this.state;

        return (
            <div>
                <IconButton
                    aria-owns={anchorEl ? 'simple-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.handleClick}>
                    <MoreVert/>
                </IconButton>
                <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={this.handleClose}
                >
                    <MenuItem onClick={() => this.props.disableWebcam()}>
                        Disable Webcam
                    </MenuItem>
                    {/*<MenuItem onClick={this.handleClose}>My account</MenuItem>*/}
                    {/*<MenuItem onClick={this.handleClose}>Logout</MenuItem>*/}
                </Menu>
            </div>
        )
    }
}

export default withStyles(styles)(ClassMenu);