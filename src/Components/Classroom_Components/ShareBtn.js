import React, {Fragment} from 'react';
import PopoverWithBtn from '../PopoverWithBtn'
import {Button, DialogActions, DialogContent, RadioGroup, FormControlLabel, IconButton, Radio} from "@material-ui/core";
import {connection as conn} from '../../interface/connection'
import { Share } from '@material-ui/icons';

export default class ShareBtn extends React.Component {
    state = {
        open: false,
        value: null,
        joined: []
    }

    async getStudentsInfo(c) {
        
    }

    handleOpenOrClose() {
        this.setState({open: !this.state.open})
    }

    handleShare = async filename => {
        if (this.state.value) {
            const response = await conn.call("file_share", {share_target: this.state.value, filename})
            if (response) {
                if (response.result === "ok") this.props.handleNotification(`Shared ${filename} to ${this.state.value}`)
            }
        }
        this.handleOpenOrClose()
    }

    handleEntering = () => {
        this.radioGroupRef.focus()
    }

    handleSelect = (event, value) => {
        this.setState({value})
    }

    render() {
        const {filename} = this.props
        return (
            <Fragment>
                <IconButton aria-label="Share" onClick={() => this.handleOpenOrClose()}>
                    <Share />
                </IconButton>
                <PopoverWithBtn open={this.state.open} onClose={this.handleOpenOrClose.bind(this)} title={filename}>
                    <DialogContent>
                        <RadioGroup
                            ref={ref => {
                                this.radioGroupRef = ref
                            }}
                            value={this.state.value}
                            onChange={this.handleSelect}
                        >
                            {this.props.session_user &&
                                this.props.session_user.map(user => (
                                    (user !== this.props.self) &&
                                        <FormControlLabel
                                            key={user}
                                            value={user}
                                            control={<Radio/>}
                                            label={user}>
                                        </FormControlLabel>
                            ))}
                        </RadioGroup>
                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={() => this.handleOpenOrClose()}>Cancel</Button>
                        <Button color="primary" onClick={() => this.handleShare(this.props.filename)}>Share</Button>
                    </DialogActions>
                </PopoverWithBtn>
            </Fragment>
        )
    }
}