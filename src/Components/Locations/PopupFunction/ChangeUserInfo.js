import Popover from '../../Popover'
import React, { Fragment } from 'react';
import {MenuItem, Grid, DialogContent, TextField, DialogContentText, Button, DialogActions, withStyles} from '@material-ui/core'

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    }
})

class ChangeUserInfo extends React.Component {
    state = {
        open: false,
        name: this.props.self,
        age: '',
        course: '',
        loginName: '',
        loginPassword: '',
        showPassword: ''
     }

    handleChangeUserInfo  = () => {
        this.setState({open: true})
    }

    handleSave = () => {
        this.setState({open: false})
    }

    handleChangeName = name => event => {
        this.setState({ [name]: event.target.value });
    };
    
    handleChangeAge = age => event => {
        this.setState({ [age]: event.target.value });
    };

    handleChangeCourse = course => event => {
        this.setState({ [course]: event.target.value });
    };

    render() { 
        const { classes } = this.props
        return (
            <Fragment>
                <MenuItem onClick={this.handleChangeUserInfo}>
                    Change UserInfo
                </MenuItem>
                <Popover title="ChangeUserInfo" open={this.state.open}>
                    <DialogContent>
                    <DialogContentText>
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item className={this.props.classes.gridItem1}>
                        <TextField
                            required
                            id="standard-name"
                            label="Name"
                            helperText="Enter your name" //or use placeholder
                            className={classes.textField}
                            value={this.state.name}
                            onChange={this.handleChangeName('name')}
                            margin="normal"
                        />
                        </Grid>
                        <Grid item className={this.props.classes.gridItem2}>
                        <TextField
                            required
                            id="standard-age"
                            label="Age"
                            helperText="Enter your age"
                            className={classes.textField}
                            value={this.state.age}
                            onChange={this.handleChangeAge('age')}
                            margin="normal"
                        />
                        </Grid>
                        <Grid item className={this.props.classes.gridItem3}>
                        <TextField
                            disabled
                            id="standard-course"
                            label="Course"
                            helperText="Enter your course"
                            className={classes.textField}
                            value={this.state.course}
                            onChange={this.handleChangeCourse('course')}
                            margin="normal"
                        />
                        </Grid>
                    </Grid>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleSave} color="primary">Save</Button>
                    <Button onClick={this.handleCancel} color="primary">Cancel</Button>
                </DialogActions>
                </Popover>
            </Fragment>
        );
    }
}
 
export default withStyles(styles, {withTheme: true})(ChangeUserInfo);
