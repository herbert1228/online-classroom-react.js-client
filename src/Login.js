import React, {Fragment} from 'react';
import {Button, TextField} from "@material-ui/core";

export default class Login extends React.Component {
    state = {
        open: false,
        loginName: '',
    };

    handle() {
        this.setState({open: !this.state.open});
    }

    handleComment(e) {
        this.setState({loginName: e.target.value});
    };

    userLogin(n) {
        let message = {
            name: 'user login',
            data: n
        };
        this.props.ws.send(JSON.stringify(message))
    }

    keyPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSubmit()
        }
    }

    handleSubmit() {
        this.userLogin(this.state.loginName);
        setTimeout(() => {
                if (this.props.login) {
                    this.handle();
                }
            }
            , 100);
    }

    render() {
        return (
            <Fragment>
                <form>
                    <TextField
                        label="Enter Your Name"
                        value={this.state.loginName}
                        onChange={this.handleComment.bind(this)}
                        onKeyDown={this.keyPress.bind(this)}
                        autoFocus={true}
                    />
                </form>
                <Button color="primary" onClick={() => this.handleSubmit()}>Login</Button>
            </Fragment>
        )
    }
}