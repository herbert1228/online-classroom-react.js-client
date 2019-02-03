import React, { Fragment } from 'react'
import {Button, TextField, Grid, withStyles, Avatar, Fade} from "@material-ui/core"
import RegisterBtn from './Components/RegisterBtn'
import Background from './css/classroom.jpg'
import {withCookies} from 'react-cookie'
import {connection as conn} from './interface/connection'
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
        margin: 30,
        width: 90,
        height: 90,
    },
    loginForm: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)'
    }
})

class Login extends React.Component {
    // static propTypes = {
    //     cookies: instanceOf(Cookies).isRequired
    // }

    state = {
        connected: false,
        loginName: "dev",
        loginPassword: "dev",
        showPassword: false,
        fade: false
    }

    componentDidMount() {
        conn.connect()
        setInterval(() => this.setState({fade: true}), 500)
        conn.addListener("socketopen", this.handleSocketOpen)
    }

    handleSocketOpen = () => {
        conn.removeListener("socketopen", this.handleSocketOpen)
        const {cookies} = this.props
        this.setState({connected: true})
        if (cookies.get("name")) {
            this.setState({loginName: cookies.get("name"), loginPassword: cookies.get("password")})
            this.handleLogin()
            if (cookies.get("location")) {
                store.dispatch({type: "changeLocation", target: parseInt(cookies.get("location"), 10)})
            }
        } else {
            this.setState({connected: true})
        }
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
            this.props.handleNotification("Welcome Herbert")
        } else {
            if (result["type"] === "reject") {
                if (result["reason"] === "invalid_params") this.props.handleNotification("Invalid username or password")
                //TODO prompt and force login 
                if (result["reason"] === "already_logged_in") this.props.handleNotification("Already logged in")
            }
        }
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
                <div className={classes.loginBg}></div>}
            {this.state.connected &&
            <Fade in={this.state.fade} timeout={{enter: 4500}}>
                <Grid container 
                    direction="column"
                    justify="center"
                    alignItems="center"
                    className={classes.loginForm}
                    spacing={16} // can be 8, 16, 24, 32 or 40dp wide
                    >
                    <Grid item>
                        <Avatar className={classes.bigAvatar} >A</Avatar>
                    </Grid>

                    <Grid item>Name</Grid>

                    <Grid item> 
                        <TextField
                            label="Username"
                            value={this.state.loginName}
                            onChange={this.handleName.bind(this)}
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
                            value={this.state.loginPassword}
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

                    <Grid item><RegisterBtn {...this.state} {...this.props}/></Grid>
                </Grid>
                </Fade>
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