import Popover from '../Popover'
import React, { Fragment } from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Button, DialogActions, DialogContent, Grid, Typography, DialogContentText, IconButton } from "@material-ui/core";
import {connection as conn, uploadURL} from '../../interface/connection'
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
        console.log(this.props.username)
        console.log(this.props.password)
        console.log(uploadURL+`/download/${username}/${password}/${filename}`)
        fetch(uploadURL+`/download/${username}/${password}/${filename}`)
        .then(response => response.text())
        // console.log(response)
        .then(data => {
            console.log(data)
            this.setState({data})
        })
        .then(() => this.handleOpenOrClose())
        .catch(e => {this.props.handleNotification(`${e}`)})
    }

    render() { 
        const { classes } = this.props
        return (
            <Fragment>
                <IconButton aria-label="View" onClick={() => this.handleView(this.props.filename)}>
                    <View />
                </IconButton>
                <Popover title="Viewing File" open={this.state.open}>
                <DialogContent>
                    <DialogContentText>
                        {/* <Grid
                            container
                            direction="column"
                            justify="center"
                            alignItems="center"
                        >
                            <Grid item> */}
                                {/* <Typography > */}
                                {this.state.data}
                                {/* </Typography>
                               
                            </Grid>
                        </Grid> */}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleCancel} color="primary">Cancel</Button>
                </DialogActions>
                </Popover>
            </Fragment>
        );
    }
}

function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
}

export default withStyles(styles, {withTheme: true})(ViewButton)