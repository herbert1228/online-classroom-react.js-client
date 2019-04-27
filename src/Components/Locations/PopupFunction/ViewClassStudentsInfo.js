import Popover from '../../PopoverNarrow'
import React, { Fragment } from 'react';
import { Grid, DialogContent, Button, withStyles, Typography} from '@material-ui/core'
import {connection as conn} from '../../../interface/connection'

const styles = theme => ({
    textField: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 200,
    },
    item: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    item_green: {
        fontSize: theme.typography.pxToRem(15),
        color: 'rgba(99, 214, 70)',
    }
})

class ViewClassStudentsInfo extends React.Component {
    state = {
        open: false,
        subed: null,
        joined: null
    }

    getStudentsInfo = async (c) => {
        const response = await conn.call("get_student_names_of_a_class", c)
        if (response.result) {
            if (response.result.subed.length <= 1) {
                this.props.handleNotification(`No one enrolled ${c.class_name} yet`)
                return
            }
            this.setState({
                open: true, 
                subed: response.result.subed, 
                joined: response.result.joined})
        }
    }

    render() { 
        const {classes} = this.props
        return (
            <Fragment>
                <Button variant="outlined" onClick={() => this.getStudentsInfo(this.props.class)}>
                    Students
                </Button>
                <Popover 
                    title="Students" open={this.state.open} 
                    onClose={()=>this.setState({open: false})}>
                    <DialogContent>
                        <Grid
                            container
                            direction="column"
                            justify="flex-start"
                            alignItems="flex-start"
                        >
                            {
                                this.state.subed &&
                                this.state.subed.map(sname => (
                                (sname !== this.props.class.owner) &&
                                <Grid item key={sname}>
                                    {(this.state.joined.includes(sname)) ?
                                        <Typography className={classes.item_green}>
                                            {sname}
                                        </Typography> :
                                        <Typography className={classes.item}>
                                            {sname}
                                        </Typography>
                                    }
                                </Grid>
                            ))}
                        </Grid>
                    </DialogContent>
                </Popover>
            </Fragment>
        )
    }
}
 
export default withStyles(styles, {withTheme: true})(ViewClassStudentsInfo);
