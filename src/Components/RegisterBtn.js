import React, {Fragment} from 'react';
import PopoverWithBtn from './PopoverWithBtn'
import {Button, DialogActions, DialogContent, DialogContentText, TextField} from "@material-ui/core";
import {connection as conn} from '../interface/connection'

export default class RegisterBtn extends React.Component {
    state = {
        open: false,
        name: "",
        password: ""
    }

    handle() {
        this.setState({open: !this.state.open});
    }

    handleName(e) {
        this.setState({name: e.target.value});
    };

    handlePassword(e) {
        this.setState({password: e.target.value});
    };

    keyPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSubmit()
        }
    }

    async handleSubmit() {
        const result = await conn.call("register", {username: this.state.name, password: this.state.password})
        if (result.type === "ok") {
            this.props.handleNotification("registered")
        } else if (result.type === "reject") {
            this.props.handleNotification(result.reason)
        }
        this.setState({open: false})
    }

    render() {
        return (
            <Fragment>
                <Button style={{marginTop: 40, marginLeft:5}} color="inherit" onClick={() => this.handle()} size="small">Register</Button>

                <PopoverWithBtn open={this.state.open} onClose={this.handle.bind(this)} title="Register">
                    <DialogContent>
                        <DialogContentText>
                            {/*{children}*/}
                        </DialogContentText>
                        <form>
                            <TextField
                                label="Enter Your Name"
                                value={this.state.name}
                                onChange={this.handleName.bind(this)}
                                onKeyDown={this.keyPress.bind(this)}
                                autoFocus={true}
                            />
                        </form>
                        <form>
                            <TextField
                                label="Enter Your Password"
                                value={this.state.password}
                                onChange={this.handlePassword.bind(this)}
                                onKeyDown={this.keyPress.bind(this)}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => this.handleSubmit()}>Register</Button>
                    </DialogActions>
                </PopoverWithBtn>
            </Fragment>
        )
    }
}