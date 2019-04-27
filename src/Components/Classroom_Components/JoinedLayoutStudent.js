import React, { Component, Fragment } from 'react'
import { AppBar, Toolbar } from '@material-ui/core'
import UserCard from '../Content_Components/UserCard'
import ClassMenu from '../Classroom_Components/ClassMenu'
import Drawer from '../Classroom_Components/Drawer'
import { withStyles } from '@material-ui/core/styles'
import ParticipantList from './ParticipantList'
import Whiteboard from './Whiteboard';
import GroupWhiteboard from './GroupWhiteboard';
import _ from 'lodash'
import {ClassStatusChannel} from '../../interface/connection'
import {store} from '../../index'
import GroupStatus from './GroupStatus';
import WebcamPermissionStatus from './WebcamPermissionStatus';
import FindComponent from './FindComponent';

const styles = theme => ({ 
    container: {
        display: 'relative',
        height: '900',
        weight: '900',
    }
})

class JoinedLayoutStudent extends Component {
    ref={}
    state = {
        webcam: {
            selfWebcam: { id: "selfWebcam", zIndex: 2, position: {x: 1312, y: 5}, size: {width: 460 / 1.5, height: (345+41) / 1.5 + 14.5} }, 
            teacherWebcam: { id: "teacherWebcam", zIndex: 2, position: {x: 10, y: 5}, size: {width: 460, height: 345+41} }, 
        },
        whiteboard: {
            selfWhiteboard: { id: "selfWhiteboard", user: this.props.self, zIndex: 3, position: {x: 820, y: 150}, size: {width: 800, height: 718} },
            teacherWhiteboard: { id: "teacherWhiteboard", user: this.props.joined.owner, zIndex: 3, position: {x: 10, y: 150}, size: {width: 800, height: 718} }, 
        },
        drawer: {
            selfDrawer: { id: "Personal Drawer", zIndex: 0, position: {x: 660, y: 5}, size: {width: 450, height: 550} }, 
            // classDrawer: { id: "Class Resources", zIndex: 0, position: {x: 10, y: 5} },// to distribute/receive files class esources
        },
        other: {
            StudentList: { id: "StudentList", zIndex: 1, position: {x: 480, y: 5}, size: {width: 0, height: 0} }, 
        }
    }
    componentDidMount() {
        ClassStatusChannel.onGroupStatusChange(this.handleGroupStatusChange)
        ClassStatusChannel.onWebcamPermissionChanged(this.handleWebcamPermissionChanged)
    }
    componentWillUnmount() {
        ClassStatusChannel.removeListener(this.handleGroupStatusChange, this.handleWebcamPermissionChanged)
    }
    componentDidUpdate(prevProps) {
        const {session_user} = this.props
        if (!session_user) return
        if (prevProps.session_user === session_user) return
        const diff = _.xor(prevProps.session_user, this.props.session_user)
        if (diff === this.props.self) return

        for (let each of diff) {
            if (each === this.props.self) continue
            if (prevProps.session_user.length > this.props.session_user.length) {
                this.props.handleNotification(each + " left")
            } else {
                this.props.handleNotification(each + " joined")
            }
        }
    }
    handleGroupStatusChange = group => {
        // {members, group}
        if (this.props.group.group !== group.group) {
            // const prevGroupIndex = this.state.whiteboard.findIndex(w => (w.type === 'group'))
            // this.state.whiteboard.splice(prevGroupIndex, 1) // delete old group whiteboard
            delete this.state.whiteboard[this.props.group.group+"Whiteboard"]
            if (group.group !== null) {
                this.setState({whiteboard: {
                    ...this.state.whiteboard,
                    [group.group+"Whiteboard"]: { type: 'group', id: group.group+"Whiteboard", user: group.group, zIndex: 2, position: {x: 850, y: 150}, size: {width: 800, height: 718} }
                }}, () => this.bringTop(group.group+"Whiteboard"))
            }
            this.props.handleClassNotification(`Assigned to ${group.group}`)
        }
        store.dispatch({type: "updateGroup", group})
    }
    handleWebcamPermissionChanged = webcamPermission => {
        store.dispatch({type: "updateWebcamPermission", webcamPermission})
    }
    bringTop = (target) => { // target: selfWebcam/etc...
        let maxZ = -1
        Object.values(this.state).forEach(outer => {
            Object.values(outer).forEach(inner => {
                if (inner.zIndex > maxZ) maxZ = inner.zIndex
            })
        })
        var outer = findKeyInNestedObject(target, this.state)
        this.setState({
            [outer]: {
                ...this.state[outer], 
                [target]: {...this.state[outer][target], zIndex: maxZ + 1}
            }
        })
    }
    testfunc = () => {
        this.ref["StudentList"].updatePosition({x: 825, y: 230})
        this.bringTop("StudentList")
    }
    render() {
        const { classes, ...other } = this.props
        return (
            <Fragment>
                <AppBar position="static" color="default">
                    <Toolbar variant="dense">
                        <ClassMenu {...other} />
                        <FindComponent components={this.state} bringTop={this.bringTop}/>
                        {/* <Button onClick={()=>this.testfunc()}>update position</Button> */}
                        <GroupStatus {...other}/>
                        <WebcamPermissionStatus {...other}/>
                    </Toolbar>
                </AppBar>
                <div className={classes.container}>
                    <ParticipantList 
                        id={"StudentList"}
                        bringTop={() => this.bringTop('StudentList')}
                        size={this.state.other["StudentList"].size}
                        position={this.state.other["StudentList"].position}
                        zIndex={this.state.other["StudentList"].zIndex}
                        inputRef={(id, el) => this.ref[id] = el}
                        enableResizing={false}
                        minWidth={0}
                        {...other}/>
                    {Object.values(this.state.webcam).map((webcam) => (
                        (webcam.id !== 'teacherWebcam' || 
                        (webcam.id === 'teacherWebcam' && 
                            this.props.session_user.includes(this.props.joined.owner))) &&
                        <UserCard
                            key={webcam.id}
                            id={webcam.id}
                            bringTop={() => this.bringTop(webcam.id)}
                            size={webcam.size}
                            position={webcam.position} 
                            zIndex={webcam.zIndex}
                            inputRef={(id, el) => this.ref[id] = el} // delete id field (modifly RndContainer as well)
                            lockAspectRatio={4/3}
                            lockAspectRatioExtraHeight={41} // Change with card header and teacher's layout
                            {...other}
                            user={(webcam.id === "teacherWebcam") ? 
                                this.props.joined.owner : this.props.self}
                        />
                    ))}
                    {Object.values(this.state.whiteboard).map((whiteboard) => {
                        if (whiteboard.type !== 'group' && 
                            (whiteboard.id !== 'teacherWhiteboard' || 
                                (whiteboard.id === 'teacherWhiteboard' && 
                                    this.props.session_user.includes(this.props.joined.owner)))) {
                            return (
                                <Whiteboard
                                    key={whiteboard.id}
                                    {...whiteboard}
                                    bringTop={() => this.bringTop(whiteboard.id)}
                                    inputRef={(id, el) => this.ref[id] = el}
                                    lockAspectRatio={4/3}
                                    lockAspectRatioExtraHeight={72}
                                    enableResizing={false}
                                    {...other}
                                />
                            )
                        }
                        else if (whiteboard.type === 'group')
                            return (
                                <GroupWhiteboard
                                    key={whiteboard.id}
                                    bringTop={() => this.bringTop(whiteboard.id)}
                                    inputRef={(id, el) => this.ref[id] = el}
                                    lockAspectRatio={4/3}
                                    lockAspectRatioExtraHeight={72}
                                    enableResizing={false}
                                    {...whiteboard}
                                    {...other}
                                />
                            )
                    })}
                    <Drawer 
                        id={"selfDrawer"}
                        bringTop={() => this.bringTop('selfDrawer')}
                        size={this.state.drawer["selfDrawer"].size}
                        position={this.state.drawer["selfDrawer"].position}
                        zIndex={this.state.drawer["selfDrawer"].zIndex}
                        inputRef={(id, el) => this.ref[id] = el}
                        enableResizing={false}
                        {...other} />
                </div>
            </Fragment>
        )
    }
}

function findKeyInNestedObject(key, nestedObj) {
    let result
    Object.keys(nestedObj).forEach(k => {
        if (Object.keys(nestedObj[k]).includes(key)) {
            result = k
        }
    })
    return result
}

export default withStyles(styles)(JoinedLayoutStudent)