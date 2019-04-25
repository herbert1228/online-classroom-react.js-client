import Popover from '../../Popover'
import React, { Fragment } from 'react';
import { DialogContent, Button, withStyles, Typography, Grid} from '@material-ui/core'
import {Stage, Layer} from 'react-konva'
import {connection as conn, genid} from '../../../interface/connection'
import Rectangle from '../Whiteboard_Components/Rectangle';
import Card from './Card'

const styles = theme => ({
})

const generalAttrs = {rotation: 0, scaleX: 1, scaleY: 1}

function defaultRect() {
    return {type: "group", x: 800/2 - 50, y: 600/2 - 50, width: 100, height: 30, fill: '#ffff0080', name: genid(), ...generalAttrs}
}

class ManageGroup extends React.Component {
    stageRef = null
    state = {
        open: false,
        groups: []
    }

    handleGroup = async () => {
        this.setState({open: true})
        // const response = await conn.call("get_student_names_of_a_class", c)
        // if (response.result) {
        //     if (response.result.subed.length <= 1) {
        //         this.props.handleNotification(`No one enrolled ${c.class_name} yet`)
        //         return
        //     }
        //     this.setState({
        //         open: true, 
        //         subed: response.result.subed, 
        //         joined: response.result.joined})
        // }
    }

    addGroup = () => {
        const newGroup = defaultRect()
        this.setState({objects: [...this.state.groups, newGroup]})
        console.log(this.props.session_user)
    }

    render() { 
        const {classes} = this.props
        return (
            <Fragment>
                <Button variant="outlined" onClick={this.handleGroup}>
                    Groups
                </Button>
                <Popover 
                    title="Group Management" open={this.state.open} 
                    onClose={()=>this.setState({open: false})}>
                    <DialogContent>
                    <Card
                      key={1}
                      id={1}
                      name={'Test'}
                      status={'Testing'}
                    />
                    {/* <Grid container spacing={24}>
                        <Grid item xs={9}>
                            <Stage
                                ref={ref=>this.stageRef=ref}
                                // onClick={()=>console.log(this.stageRef.getPointerPosition())}
                                onMouseMove={this.handleMouseMove}
                                onContextMenu={this.handleStageContextMenu}
                                onMouseDown={this.handleStageMouseDown}
                            >
                                <Layer>
                                    {this.state.groups.map((group, i) => {
                                        if (group === undefined) console.log(group)
                                        else if (group.type === "group") {
                                            return <Rectangle 
                                                        key={group.name} 
                                                        {...group}
                                                    />
                                        }
                                        else if (group.type === "user")
                                            return null
                                        return null
                                    })}
                                </Layer>
                            </Stage>
                        </Grid>
                        <Grid item xs={3}>
                            <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                                <Button onClick={this.addGroup}>Add Group</Button>

                                {(this.props.session_user).map(user => {
                                    console.warn(user)
                                    {user}
                                })}
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
