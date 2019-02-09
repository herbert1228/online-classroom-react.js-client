import React from 'react';
import {Dialog, DialogContent, DialogContentText, DialogTitle, withStyles, Button, DialogActions} from "@material-ui/core";

const styles = theme => ({
    dialog: {
        width: '70%',
        height: '90%',
        maxWidth: '90%',
        // maxHeight: 435
    }
});

class Popover extends React.Component {

    render() {
        const {title, children, classes, open} = this.props;
        return (
            <Dialog
                open={open}
                onClose={() => this.props.onClose? this.props.onClose() : null}
                aria-labelledby="form-dialog-title"
                classes={{paper: classes.dialog}}
            >
                <DialogTitle id="form-dialog-title">{title}</DialogTitle>
                {/*<DialogContent>
                    <DialogContentText>
                        {children}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button color="primary">Save</Button>
                <Button color="primary">Cancel</Button>
                </DialogActions> */}
                {children}
            </Dialog>
        )
    }
}

export default withStyles(styles)(Popover);