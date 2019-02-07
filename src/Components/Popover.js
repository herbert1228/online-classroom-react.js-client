import React from 'react';
import {Dialog, DialogContent, DialogContentText, DialogTitle, withStyles} from "@material-ui/core";

const styles = theme => ({
    dialog: {
        width: '50%',
        height: '80%',
        maxWidth: '80%',
        // maxHeight: 435
    }
});

class Popover extends React.Component {

    render() {
        const {title, children, classes, open} = this.props;
        return (
            <Dialog
                open={open}
                onClose={() => this.props.onClose()}
                aria-labelledby="form-dialog-title"
                classes={{paper: classes.dialog}}
            >
                <DialogTitle id="form-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {children}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="primary">Create</Button>
                </DialogActions>
            </Dialog>
        )
    }
}

export default withStyles(styles)(Popover);