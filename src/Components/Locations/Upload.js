import React, { Fragment } from 'react'
import { compose } from 'redux'
import { Header, NotificationBar } from '../../Components'
import RegisterBtn from '../../RegisterBtn'
// import { instanceOf } from 'prop-types'
import { withCookies } from 'react-cookie'
import { Button, TextField, withStyles, Grid } from '@material-ui/core'
// import DrawerLeft from './Components/DrawerLeft'
import '../../css/App.css'
import Background from '../../css/classroom.jpg'
import Dropzone from 'react-dropzone'
import classNames from 'classnames'
// import { read } from 'fs';

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: "100vh", //100% after adding more components
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    flex: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    loginForm: {
        padding: "15%",
        width: "30%",
        backgroundColor: 'rgba(256, 256, 256, 0.4)',
    },
    formInput: {
        margin: 10
    },
    loginBg: {
        backgroundImage: 'url(' + Background + ')',
        backgroundSize: 'cover',
        overflow: 'hidden',
        height: "100vh"
    },
    dropzone: {
        // height: '30vh',
        // width: '50vw',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)'
    }
})

// const url = "ws://localhost:8500"
// const url = "ws://192.168.8.6:8500"
const url = `ws://${window.location.hostname}:8500/`
// const url = "ws://overcoded.tk:8500"
// const url = "ws://13.250.127.51:8500"

class Upload extends React.Component {
    constructor(prop) {
        super(prop);
        this.state = {
            open: false,
            self: null,
            ws: null,
            loginName: "dev",
            loginPassword: "dev",
            location: 0,
            showNotification: false,
            notificationMessage: "",
            connected: false
            // files: []
        }
    }

    notificationQueue = []

    ws_init() {
        const { cookies } = this.props
        this.setState({ ws: new WebSocket(url) }, () => {
            this.ws = this.state.ws
            this.ws.onmessage = this.message.bind(this)
            this.ws.onerror = (e) => console.log(e)
            this.ws.onclose = (e) => {
                if (this.state.self === null) {
                    cookies.remove("name")
                    cookies.remove("password")
                    this.ws_init()
                    this.handleNotification("LOGIN REJECTED! (reason: already logged in)")
                } else {
                    // window.confirm("Disconnected, press OK to reconnect") && this.ws_init()
                    setTimeout(() => this.ws_init(), 2000)
                }
                this.setState({ joined: null })
            }
            this.ws.onopen = () => {
                if (cookies.get("name")) {
                    this.setState({ loginName: cookies.get("name"), loginPassword: cookies.get("password") })
                    this.handleSubmit()
                } else {
                    this.setState({ connected: true })
                }
                if (cookies.get("location")) {
                    this.setState({ location: parseInt(cookies.get("location"), 10) })
                }
            }
        })
    }

    componentDidMount() {
        this.ws_init()
    }

    message(e) {
        // console.log("onmessage", JSON.parse(e.data))
        const event = JSON.parse(e.data)
        const { cookies } = this.props
        switch (event.type) {

            case "register_success":
                this.handleNotification("registered")
                break
            case "register_failed":
                this.handleNotification("register failed")
                break
            case 'logout_success':
                cookies.remove("name")
                cookies.remove("password")
                cookies.remove("location")
                this.setState({ self: null, loginPassword: "dev", loginName: "dev", location: 0, open: false })
                break
            case 'login_failed':
                console.log("login_failed")
                break
            case 'login_success':
                this.setState({ self: this.state.loginName, connected: true })
                cookies.set("name", this.state.loginName) // option: {path: "/"}
                cookies.set("password", this.state.loginPassword)
                this.setState({ loginPassword: "" })
                break
            default:
                break
        }
    }

    handleDrawer = () => {
        this.setState({ open: !this.state.open });
    };

    handleName(e) {
        this.setState({ loginName: e.target.value });
    };

    handlePassword(e) {
        this.setState({ loginPassword: e.target.value });
    };

    keyPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSubmit()
        }
    }

    handleSubmit() {
        let message = { type: "login", username: this.state.loginName, password: this.state.loginPassword }
        this.ws.send(JSON.stringify(message))
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
            const reader = new FileReader()
            reader.onload = () => {
                console.log(reader.result)
            }
            reader.readAsBinaryString(acceptedFiles[0])
        }
    }

    render() {
        const { classes } = this.props
        if (this.state.self) {
            return (
                <div className={classes.root}>
                    <Header
                        onClickOpen={() => this.handleDrawer()}
                        {...this.state}
                    />
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
        } else if (this.state.connected) {
            return (
                <Fragment>
                    <Grid container className={classes.loginBg}>
                        <Grid item className={classes.loginForm}>
                            <form className={classes.formInput}>
                                <TextField
                                    label="Enter Your Name"
                                    value={this.state.loginName}
                                    onChange={this.handleName.bind(this)}
                                    onKeyDown={this.keyPress.bind(this)}
                                    autoFocus={true}
                                />
                            </form>
                            <form className={classes.formInput}>
                                <TextField
                                    label="Enter Your Password"
                                    value={this.state.loginPassword}
                                    onChange={this.handlePassword.bind(this)}
                                    onKeyDown={this.keyPress.bind(this)}
                                />
                            </form>
                            <Button
                                color="primary"
                                variant="outlined"
                                onClick={this.handleSubmit.bind(this)}
                                size="large"
                                className={classes.formInput}
                            >
                                Login
                            </Button>
                            <RegisterBtn {...this.state} />
                        </Grid>
                    </Grid>
                    <NotificationBar
                        message={this.state.notificationMessage}
                        open={this.state.showNotification}
                        handleClose={this.handleDismissNotification.bind(this)}
                        handleExited={this.processQueue}
                    />
                </Fragment>
            )
        } else { return (<p> </p>) }
    }
}

export default compose(
    withCookies,
    withStyles(styles, { withTheme: true })
)(Upload);