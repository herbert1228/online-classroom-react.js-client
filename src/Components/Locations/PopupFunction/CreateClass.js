import React, {Fragment} from 'react';
import PopoverWithBtn from '../../PopoverWithBtn'
import {Button, DialogActions, DialogContent, DialogContentText, TextField} from "@material-ui/core";
import { connection as conn } from '../../../interface/connection'
import {store} from '../../../index'

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

    async handleSubmit() {
        const response = await conn.call("create_class", {class_name: this.state.class_name})
        if (response.type === "ok") {
            // [created, enrolled] = Promise.all(conn.call(), conn.call())
            const created = await conn.call("get_created_class")
            const enrolled = await conn.call("get_enrolled_class")
            store.dispatch({
                type:"get_created_class", 
                result: created.result
            })
            store.dispatch({
                type: "get_enrolled_class",
                result: enrolled.result
            })
            this.props.handleNotification("created class success")
        }
        if (response.type === "reject") {
            this.props.handleNotification(`created class failed, reason: ${response.reason}`)
        }
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
                                autoFocus
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