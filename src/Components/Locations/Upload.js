import React from 'react'
import { compose } from 'redux'
import { NotificationBar } from '../../Components'
import { TextField, Grid, withStyles } from "@material-ui/core"
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { withCookies } from 'react-cookie'
import '../../css/App.css'
import Dropzone from 'react-dropzone'
import classNames from 'classnames'
import Link from 'react-router-dom/Link'
// import axios from 'axios'

const styles = theme => ({
    dropzone: {
        position: 'absolute',
        top: '65%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)'
    },
    form: {
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)'
    }
})

const url = `http://${window.location.hostname}:8600/upload`
// const url = "http://overcoded.tk:8600/upload"

class Upload extends React.Component {
    state = {
        showNotification: false,
        notificationMessage: "",
        connected: false,
        showPassword: false,
        username: "",
        password: ""
    }

    componentDidMount() {
        const {cookies} = this.props
        if (cookies.get("name")) {
            this.setState({username: cookies.get("name"), password: cookies.get("password")})
        } 
    }

    notificationQueue = []

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

    handleName = e => {
        this.setState({ username: e.target.value });
    }

    handlePassword = (e) => {
        this.setState({password: e.target.value});
    }

    keyPress = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault()
        }
    }

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
    }

    handleDrop = (acceptedFiles, rejectedFiles) => {
        console.log({ acceptedFiles, rejectedFiles })
        if (acceptedFiles.length > 0){
            let formdata = new FormData()
            formdata.append("data", acceptedFiles[0], acceptedFiles[0].name) //3rd arg refer to filename
            formdata.append("timestamp", (new Date()).toISOString())
            formdata.append("username", this.state.username)
            formdata.append("password", this.state.password)
            fetch(url, {
                method: "POST",
                body: formdata
            })
            .then(response => response.text())
            .then(data => this.handleNotification(data))
            .catch(e => {this.handleNotification(`${e}`)})
        }
    }

    render() {
        const { classes } = this.props
        return (
            <div>
                <Link to="/">Back to Classroom</Link>
                <Grid container 
                    direction="column"
                    justify="center"
                    alignItems="center"
                    className={classes.form}
                    spacing={16} // can be 8, 16, 24, 32 or 40dp wide
                    >
                    <Grid item> 
                        <TextField
                            label="Username"
                            value={this.state.username}
                            onChange={this.handleName}
                            onKeyDown={this.keyPress}
                            autoFocus={true}
                            variant="filled"
                            style={{width: 160}}
                        />
                    </Grid>

                    <Grid item>
                        <TextField
                            variant="filled"
                            type={this.state.showPassword ? 'text' : 'password'}
                            label="Password"
                            value={this.state.password}
                            onChange={this.handlePassword.bind(this)}
                            onKeyDown={this.keyPress}
                            style={{width: 160}}
                            InputProps={{
                                endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                    aria-label="Toggle password visibility"
                                    onClick={this.handleClickShowPassword}
                                    >
                                    {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                </Grid>
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
                                            <p>Drop files here... (50MB max)</p> :
                                            <p>Drop files here, or click to select files to upload (50MB max)</p>
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