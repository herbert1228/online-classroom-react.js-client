import React from 'react'
import { compose } from 'redux'
import { NotificationBar } from '../../Components'
// import { instanceOf } from 'prop-types'
import { withCookies } from 'react-cookie'
import { withStyles } from '@material-ui/core'
import '../../css/App.css'
import Dropzone from 'react-dropzone'
import classNames from 'classnames'
// import axios from 'axios'

const styles = theme => ({
    dropzone: {
        // height: '30vh',
        // width: '50vw',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)'
    }
})

const url = `http://${window.location.hostname}:8600/image`
// const url = "ws://overcoded.tk:8600"

class Upload extends React.Component {
    constructor(prop) {
        super(prop);
        this.state = {
            showNotification: false,
            notificationMessage: "",
            connected: false
            // files: []
        }
    }

    notificationQueue = []

    handleDrawer = () => {
        this.setState({ open: !this.state.open });
    }

    handleNotification = (message) => {
        this.notificationQueue.push(message)
        if (this.state.showNotification) {
            this.setState({ showNotification: false });
        } else {
            this.processQueue();
        }
    }

    processQueue = () => {
        if (this.notificationQueue.length > 0) {
            this.setState({
                notificationMessage: this.notificationQueue.shift(),
                showNotification: true,
            })
        }
    }

    handleDismissNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ showNotification: false });
    }

    handleDrop = (acceptedFiles, rejectedFiles) => {
        console.log({ acceptedFiles, rejectedFiles })
        if (acceptedFiles.length > 0){
            let formdata = new FormData()
            formdata.append("data", acceptedFiles[0], "upload_file")
            formdata.append("timestamp", (new Date()).toISOString())
            formdata.append("type", "image")
            // fetch(url, {
            //     method: "POST",
            //     mode: "cors",
            //     body: formdata
            // })
            // .then(res => console.log(res))
            // .catch(err => console.error("Error:", err))
            fetch(url, {
                headers : {
                  "Content-Type": "application/json",
                  "Accept": "application/json"
                }
            })
            .then((response) => response.json())
            .then((messages) => {console.log("messages");});
        }
    }

    render() {
        const { classes } = this.props
        return (
            <div className={classes.root}>
                <div className={classes.dropzone}>
                    <Dropzone onDrop={this.handleDrop}>
                        {({ getRootProps, getInputProps, isDragActive }) => {
                            return (
                                <div
                                    {...getRootProps()}
                                    className={classNames("dropzone", { "dropzone--isActive": isDragActive })}
                                >
                                    <input {...getInputProps()} />
                                    {
                                        isDragActive ?
                                            <p>Drop files here...</p> :
                                            <p>Drop files here, or click to select files to upload</p>
                                    }
                                </div>
                            )
                        }}
                    </Dropzone>
                </div>
                <NotificationBar
                    message={this.state.notificationMessage}
                    open={this.state.showNotification}
                    handleClose={this.handleDismissNotification.bind(this)}
                    handleExited={this.processQueue}
                />
            </div>
        )
    } 
}

export default compose(
    withCookies,
    withStyles(styles, { withTheme: true })
)(Upload);