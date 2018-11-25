import React, {Fragment} from 'react';
import PopoverWithBtn from '../../PopoverWithBtn'
import {Button, DialogActions, DialogContent, DialogContentText, TextField} from "@material-ui/core";

export default class CreateClass extends React.Component {
    state = {
        open: false,
        t_name: "",
        class_name: ""
    }

    handle() {
        this.setState({open: !this.state.open});
    }

    handleT(e) {
        this.setState({t_name: e.target.value});
    }

    handleClassName(e) {
        this.setState({class_name: e.target.value});
    }

    keyPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSubmit()
        }
    }

    handleSubmit() {
        let message = {type: "subscribe_class", owner: this.state.t_name, class_name: this.state.class_name}
        this.props.ws.send(JSON.stringify(message))
        this.setState({open: false})
    }

    render() {
        return (
            <Fragment>
                <Button variant="outlined" color="inherit" onClick={() => this.handle()}>Enroll Class</Button>

                <PopoverWithBtn open={this.state.open} onClose={this.handle.bind(this)} title="Enroll Class">
                    <DialogContent>
                        <DialogContentText>
                            {/*{children}*/}
                        </DialogContentText>
                        <form>
                            <TextField
                                label="Teacher"
                                value={this.state.t_name}
                                onChange={this.handleT.bind(this)}
                                onKeyDown={this.keyPress.bind(this)}
                            />
                        </form>
                        <form>
                            <TextField
                                label="name of class"
                                value={this.state.class_name}
                                onChange={this.handleClassName.bind(this)}
                                onKeyDown={this.keyPress.bind(this)}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => this.handleSubmit()}>Enroll</Button>
                    </DialogActions>
                </PopoverWithBtn>
            </Fragment>
        )
    }
}