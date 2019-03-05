import Popover from '../Popover'
import React, { Fragment } from 'react';
import {withStyles} from '@material-ui/core/styles'
import { DialogContent, IconButton } from "@material-ui/core";
import {uploadURL} from '../../interface/connection'
import View from '@material-ui/icons/Pageview';

const styles = theme => ({

})

class ViewButton extends React.Component {
    state = { 
        open: false,
        data: null,
    }

    handleClose = () => {
        this.setState({open: false})
    }

    handleOpen() {
        this.setState({open: true})
    }

    handleView = (filename) => {
        const {username,  password} = this.props
        fetch(uploadURL+`/download/${username}/${password}/${filename}`)
        .then(response => response.text())
        // .then(response => response.blob())
        // .then(blob => {
        //     const reader  = new FileReader()
        //     reader.addEventListener("load", () => {
        //         this.setState({data: reader.result})
        //       }, false)
            
        //     reader.readAsDataURL(blob);
        // })
        .then(() => this.handleOpen())
        .catch(e => {this.props.handleNotification(`${e}`)})
    }

    cannotView(filename) {
        if (filename.substr(-4) === ".jpg"
            || filename.substr(-4) === ".png"
            || filename.substr(-4) === ".gif"
            || filename.substr(-4) === ".svg"
            || filename.substr(-4) === ".bmp"
            // || filename.substr(-4) === ".pdf"
            || filename.substr(-5) === ".jpeg"
            || filename.substr(-5) === ".apng"){
            return false
        }
        return true
    }

    render() { 
        const { username, password, filename} = this.props
        return (
            <Fragment>
                <IconButton 
                    aria-label="View" 
                    disabled={this.cannotView(filename)}
                    onClick={() => this.handleView(filename)}>
                    <View />
                </IconButton>
                <Popover title="Viewing File" open={this.state.open} onClose={this.handleClose}>
                <DialogContent>
                    <img 
                        draggable
                        onDragStart={this.handleClose}
                        alt="View Selected File"
                        src={uploadURL+`/download/${username}/${password}/${filename}`} 
                        width="100%" height="100%"/>
                </DialogContent>
                </Popover>
            </Fragment>
        );
    }
}

export default withStyles(styles, {withTheme: true})(ViewButton)