import React, {Fragment} from 'react';
import PopoverWithBtn from '../../PopoverWithBtn'
import {Button, DialogActions, DialogContent, DialogContentText, TextField} from "@material-ui/core";

export default class CreateClass extends React.Component {
    state = {
        open: false,
        class_name: ""
    }

    handle() {
        this.setState({open: !this.state.open});
    }

    handleClassName(e) {
        this.setState({class_name: e.target.value});
    };

    keyPress(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSubmit()
        }
    }

    handleSubmit() {
        let message = {type: "create_class", class_name: this.state.class_name}
        this.props.ws.send(JSON.stringify(message))
        this.setState({open: false})
    }

    render() {
        return (
            <Fragment>
                <Button variant="outlined" color="inherit" onClick={() => this.handle()}>Create Class</Button>

                <PopoverWithBtn open={this.state.open} onClose={this.handle.bind(this)} title="Create Class">
                    <DialogContent>
                        <DialogContentText>
                            {/*{children}*/}
                        </DialogContentText>
                        <form>
                            <TextField
                                label="Name of class"
                                value={this.state.class_name}
                                onChange={this.handleClassName.bind(this)}
                                onKeyDown={this.keyPress.bind(this)}
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => this.handleSubmit()}>Create</Button>
                    </DialogActions>
                </PopoverWithBtn>
            </Fragment>
        )
    }
}