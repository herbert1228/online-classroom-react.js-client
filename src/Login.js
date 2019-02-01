import React, { Fragment } from 'react'
import {Button, TextField, Grid, withStyles, Avatar} from "@material-ui/core"
import RegisterBtn from './RegisterBtn'
import Background from './css/classroom.jpg'
import {withCookies} from 'react-cookie'
import {connection as conn} from './interface/connection'
import {instanceOf} from 'prop-types'
import {compose} from 'redux'
import {store} from './index'
import Loading from './Components/Loading'
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const styles = theme => ({
    loginBg: {
        backgroundImage: 'url(' + Background + ')',
        filter: 'blur(5px)',
        opacity: 0.8,
        backgroundSize: 'cover',
        overflow: 'hidden',
        height: "100vh"
    },
    bigAvatar: {
        margin: 10,
        width: 60,
        height: 60,
    },
    textField: {
        background: 'rgba(255,255,255,1)',
        margin: 10,
        borderRadius: 51,
        paddingLeft: 45,
        paddingRight: 45
    }
})

const url = `ws://${window.location.hostname}:8500/`
// const url = "ws://overcoded.tk:8500"

class Login extends React.Component {
    // static propTypes = {
    //     cookies: instanceOf(Cookies).isRequired
    // }

    state = {
        connected: false,
        loginName: "dev",
        loginPassword: "dev",
        showPassword: false
    }

    componentDidMount() {
        const {cookies} = this.props
        conn.connect(url)
        conn.addListener("socketclose", this.handleSocketClose)
        conn.addListener("socketopen", () => {
            this.setState({connected: true})
            if (cookies.get("name")) {
                this.setState({loginName: cookies.get("name"), loginPassword: cookies.get("password")})
                this.handleLogin()
            } else {
                this.setState({connected: true})
            }
            if (cookies.get("location")) {
                store.dispatch({type: "changeLocation", target: parseInt(cookies.get("location"), 10)})
            }
        })
    }

    handleSocketClose = () => {
        const {cookies} = this.props
        if (this.props.self === null) {
            cookies.remove("name")
            cookies.remove("password")
            conn.connect(url)
            this.props.handleNotification("LOGIN REJECTED! (reason: already logged in)")
        } else {
            // window.confirm("Disconnected, press OK to reconnect") && this.ws_init()
            setTimeout(() => conn.connect(url), 2000)
        }
        this.setState({joined: null})
    }

    handleLogin = async () => {
        const result = await conn.call("login", {username: this.state.loginName, password: this.state.loginPassword})
        if (result["type"] === "ok") {
            const {cookies} = this.props
            store.dispatch({type:"login", loginName: this.state.loginName})
            this.setState({connected: true})
            //TODO listen the following events
            store.dispatch({
                type:"get_created_class", 
                result: await conn.call("get_created_class")
            })
            store.dispatch({
                type: "get_subscribed_class",
                result: await conn.call("get_subscribed_class")
            })
            store.dispatch({
                type: "get_started_class",
                result: await conn.call("get_started_class")
            })
            cookies.set("name", this.state.loginName) // option: {path: "/"}
            cookies.set("password", this.state.loginPassword)
            this.setState({loginPassword: ""})
        } else {
            if (result["type"] === "reject") {
                if (result["reason"] === "invalid_params") this.props.handleNotification("Invalid username or password")
                //TODO prompt and force login 
                if (result["reason"] === "already_logged_in") this.props.handleNotification("Already logged in")
            }
             this.props.handleNotification("login_failed") //TODO provide more info
        }
        // case 'logout_success':
        //         cookies.remove("name") //noneed
        //         cookies.remove("password") //noneed
        //         cookies.remove("location") //noneed
        //         this.setState({self: null, loginPassword: "dev", loginName: "dev", location: 0, open: false}) //set self only
        //         break
    }

    handleName = (e) => {
        this.setState({loginName: e.target.value});
    }

    handlePassword = (e) => {
        this.setState({loginPassword: e.target.value});
    }

    keyPress = (e) => {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleLogin()
        }
    }

    handleClickShowPassword = () => {
        this.setState(state => ({ showPassword: !state.showPassword }));
      }

    render() {
        const {classes} = this.props
        return (
            <Fragment>
            {this.state.connected &&
                <Grid container 
                    direction="column"
                    justify="center"
                    alignItems="center"
                    className={classes.loginBg}>
                    <Grid item>
                        <Avatar 
                            className={classes.bigAvatar} >A</Avatar>
                    </Grid>

                    <Grid item>Name</Grid>

                    <Grid item> 
                        <TextField
                            label="Enter Your Name"
                            value={this.state.loginName}
                            onChange={this.handleName.bind(this)}
                            onKeyDown={this.keyPress}
                            autoFocus={true}
                            variant="filled"
                        />
                    </Grid>

                    <Grid item>
                        <TextField
                            id="filled-adornment-password"
                            variant="filled"
                            type={this.state.showPassword ? 'text' : 'password'}
                            label="Password"
                            value={this.state.password}
                            onChange={this.handlePassword.bind(this)}
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

                    <Grid item>
                        <Button
                                color="primary"
                                variant="outlined"
                                onClick={this.handleLogin}
                                size="large"
                                className={classes.formInput}
                            >
                                Login
                        </Button>
                    </Grid>

                    <Grid item><RegisterBtn {...this.state}/></Grid>
                </Grid>
            }
            {!this.state.connected &&
                <Loading/>
            }
            </Fragment>
        )
    }
}

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
)(Login)