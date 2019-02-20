import Popover from '../Popover'
import React, { Fragment } from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Button, DialogActions, DialogContent, IconButton } from "@material-ui/core";
import {uploadURL} from '../../interface/connection'
import View from '@material-ui/icons/Pageview';


const styles = theme => ({

})

class ViewButton extends React.Component {
    state = { 
        open: false,
        data: null,
     }

    handleCancel = () => {
        this.setState({open: false})
    }

    handleOpenOrClose() {
        this.setState({open: !this.state.open})
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
        .then(() => this.handleOpenOrClose())
        .catch(e => {this.props.handleNotification(`${e}`)})
    }

    render() { 
        const { username, password, filename} = this.props
        return (
            <Fragment>
                <IconButton aria-label="View" onClick={() => this.handleView(this.props.filename)}>
                    <View />
                </IconButton>
                <Popover title="Viewing File" open={this.state.open}>
                <DialogContent>
                    <img 
                        alt="View Selected File"
                        src={uploadURL+`/download/${username}/${password}/${filename}`} 
                        width="100%" height="100%"/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleCancel} color="primary">Cancel</Button>
                </DialogActions>
                </Popover>
            </Fragment>
        );
    }
}

export default withStyles(styles, {withTheme: true})(ViewButton)