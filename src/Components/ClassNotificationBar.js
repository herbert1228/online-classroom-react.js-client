import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
// import Button from '@material-ui/core/Button';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';

const styles = theme => ({
    close: {
        padding: theme.spacing.unit / 2,
    },
})

// function TransitionLeft() {
//     return <Slide direction='up'></Slide>
// }

class ClassNotificationBar extends React.Component {
    state = {
        // Transition: null
    }
    // componentDidMount() {
    //     this.setState({open: true, TransitionLeft})
    // }
    render() {
        const { classes } = this.props;
        return (
            <div>
                <Snackbar
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    // TransitionComponent={this.state.Transition}
                    open={this.props.open}
                    autoHideDuration={10000}
                    onClose={this.props.handleClose}
                    onExited={this.props.handleExited}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">{this.props.message}</span>}
                    action={[
                        //<Button key="undo" color="secondary" size="small" onClick={this.props.handleClose}>
                        //    UNDO
                        //</Button>,
                        <IconButton
                            key="close"
                            aria-label="Close"
                            color="inherit"
                            className={classes.close}
                            onClick={this.props.handleClose}
                        >
                            <CloseIcon />
                        </IconButton>,
                    ]}
                />
            </div>
        );
    }
}

ClassNotificationBar.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ClassNotificationBar);