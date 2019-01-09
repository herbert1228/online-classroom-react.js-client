import React, {Fragment} from 'react'
import {compose} from 'redux'
import {Content, Header, Classroom, ClassList, Notebooks, Mailbox, NotificationBar} from './Components'
import RegisterBtn from './RegisterBtn'
import PropTypes, {instanceOf} from 'prop-types'
import {Cookies, withCookies} from 'react-cookie'
import {Button, TextField, withStyles, Grid} from '@material-ui/core'
import DrawerLeft from './Components/DrawerLeft'
import './css/App.css'
import Background from './css/classroom.jpg'

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
    }
})

const url = "ws://localhost:8500"
// const url = "ws://192.168.8.6:8500"
// const url = "ws://overcoded.tk:8500"

class App extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    }

    constructor(prop) {
        super(prop);
        this.state = {
            open: false,
            self: null,
            ws: null,
            loginName: "dev",
            loginPassword: "dev",
            location: 0,
            createdClass: [],
            enrolledClass: [],
            startedClass: [],
            session_user: [],
            joined: null,
            showNotification: false,
            notificationMessage: "",
            connected: false,
            otherId: null
        }
    }

    notificationQueue = []

    ws_init() {
        const {cookies} = this.props
        this.setState({ws: new WebSocket(url)}, () => {
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
                this.setState({joined: null})
            }
            this.ws.onopen = () => {
                if (cookies.get("name")) {
                    this.setState({loginName: cookies.get("name"), loginPassword: cookies.get("password")})
                    this.handleSubmit()
                } else {
                    this.setState({connected: true})
                }
                if (cookies.get("location")) {
                    this.setState({location: parseInt(cookies.get("location"), 10)})
                }
            }
        })
    }

    componentDidMount() {
        this.ws_init()
    }

    message(e) {
        console.log("onmessage", JSON.parse(e.data))
        const event = JSON.parse(e.data)
        const {cookies} = this.props
        switch (event.type) {
            // case 'init':
            //     this.setState({users: event.data.users, chat: event.data.chat})
            //     break
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
                this.setState({self: null, loginPassword: "dev", loginName: "dev", location: 0, open: false})
                break
            case 'login_failed':
                console.log("login_failed")
                break
            case 'login_success':
                this.setState({self: this.state.loginName, connected: true})
                this.ws.send(JSON.stringify({type: "get_created_class"}))
                this.ws.send(JSON.stringify({type: "get_subscribed_class"}))
                this.ws.send(JSON.stringify({type: "get_started_class"}))
                cookies.set("name", this.state.loginName) // option: {path: "/"}
                cookies.set("password", this.state.loginPassword)
                this.setState({loginPassword: ""})
                break
            // case 'new chat':
            //     this.setState({chat: event.data})
            //     break
            // case 'draw to client':
            //     this.setState({users: event.data})
            //     break
            case "get_created_class":
                this.setState({createdClass: event.created_classes})
                break
            case "get_subscribed_class":
                this.setState({enrolledClass: event.subscribed_class})
                break
            case "create_class_success":
                this.ws.send(JSON.stringify({type: "get_created_class"}))
                this.ws.send(JSON.stringify({type: "get_subscribed_class"}))
                this.handleNotification("created class success")
                break
            case "create_class_failed":
                this.handleNotification("created class failed")
                break
            case "join_class success":
                this.handleNotification(`join ${event.owner}'s class: ${event.class_name} success`)
                this.setState({joined: {owner: event.owner, class_name: event.class_name}}, () => this.changeScene(1))
                break
            case "join_class failed":
                this.handleNotification("join class failed")
                break
            case "start_class success":
                this.handleNotification("start class success")
                break
            case "start_class failed":
                this.handleNotification("start class failed")
                break
            case "subscribe_class success":
                this.ws.send(JSON.stringify({type: "get_subscribed_class"}))
                this.ws.send(JSON.stringify({type: "get_started_class"}))
                this.handleNotification("subscribe " + event.owner + "'s " + event.class_name + " success")
                break
            case "subscribe_class failed":
                this.handleNotification("subscribe " + event.owner + "'s " + event.class_name + " failed")
                break
            case "get_started_class":
                this.setState({startedClass: event.started_class})
                break
            case "get_session_user":
                this.setState({session_user: event.session_user})
                break
            case "leave_class success":
                this.handleNotification("leave_class success")
                this.setState({session_user: [], joined: null})
                break
            default:
                break
        }
    }

    changeScene(target) {
        this.setState({location: target})
        const {cookies} = this.props
        cookies.set("location", target)
    }

    handleDrawer = () => {
        this.setState({open: !this.state.open});
    };

    handleName(e) {
        this.setState({loginName: e.target.value});
    };

    handlePassword(e) {
        this.setState({loginPassword: e.target.value});
    };

    keyPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSubmit()
        }
    }

    handleSubmit() {
        let message = {type: "login", username: this.state.loginName, password: this.state.loginPassword}
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

    render() {
        const {classes} = this.props
        if (this.state.self) {
            return (
                <div className={classes.root}>
                    <Header
                        onClickOpen={() => this.handleDrawer()}
                        {...this.state}
                    />
                    <DrawerLeft
                        open={this.state.open}
                        onClickClose={this.handleDrawer.bind(this)}
                        changeScene={this.changeScene.bind(this)}
                        location={this.state.location}
                    />
                    {this.state.location === 0 &&<Content {...this.state} />}
                    {this.state.location === 1 &&<Classroom {...this.state} changeScene={this.changeScene.bind(this)}/>}
                    {this.state.location === 2 &&<ClassList {...this.state} changeScene={this.changeScene.bind(this)}/>}
                    {this.state.location === 3 &&<Notebooks {...this.state}/>}
                    {this.state.location === 4 &&<Mailbox {...this.state}/>}
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
                            <RegisterBtn {...this.state}/>
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
        } else {return (<p> </p>)}
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true})
)(App);