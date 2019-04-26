import Popover from '../../Popover'
import React, { Fragment } from 'react';
import { DialogContent, Button, withStyles, Typography, Grid} from '@material-ui/core'
import {Stage, Layer} from 'react-konva'
import {connection as conn, genid} from '../../../interface/connection'
import Rectangle from '../Whiteboard_Components/Rectangle';
import Card from './Card'
import App from './App';

const styles = theme => ({
})

const generalAttrs = {rotation: 0, scaleX: 1, scaleY: 1}

function defaultRect() {
    return {type: "group", x: 800/2 - 50, y: 600/2 - 50, width: 100, height: 30, fill: '#ffff0080', name: genid(), ...generalAttrs}
}

class ManageGroup extends React.Component {
    stageRef = null
    state = {
        groups: []
    }

    addGroup = () => {
        const newGroup = defaultRect()
        this.setState({objects: [...this.state.groups, newGroup]})
        console.log(this.props.session_user)
    }

    render() { 
        const {classes, ...others} = this.props
        return (
            <Fragment>
                <Popover 
                    title="Group Management" open={this.props.open} 
                    onClose={this.props.onClose}>
                    <DialogContent>
                        <App {...others}/>
                        {/* <Grid container spacing={24}>
                            <Grid item xs={9}>
                            </Grid>
                            <Grid item xs={3}>
                                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                                    <Button onClick={this.addGroup}>Add Group</Button>
                                </div>
                            </Grid>
                        </Grid> */}
                    </DialogContent>
                </Popover>
            </Fragment>
        )
    }
}
 
export default withStyles(styles, {withTheme: true})(ManageGroup);
