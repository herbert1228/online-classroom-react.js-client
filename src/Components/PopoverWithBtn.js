import React from 'react';
import {Dialog, DialogTitle, withStyles} from "@material-ui/core";

const styles = theme => ({
    dialog: {
        // width: '50%',
        // height: '80%',
        maxHeight: '30%',
        maxWidth: '30%',
        // maxHeight: 435
    }
});

class PopoverWithBtn extends React.Component {

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
                {children}
                {/*<DialogContent>*/}
                    {/*<DialogContentText>*/}
                        {/*{children}*/}
                    {/*</DialogContentText>*/}
                {/*</DialogContent>*/}
                {/*<DialogActions>*/}
                {/*<Button color="primary">Create</Button>*/}
                {/*</DialogActions>*/}
            </Dialog>
        )
    }
}

export default withStyles(styles)(PopoverWithBtn);