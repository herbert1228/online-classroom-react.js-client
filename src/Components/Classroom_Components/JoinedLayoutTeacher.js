import React, { Component, Fragment } from 'react'
import { AppBar, Toolbar, Button } from '@material-ui/core'
import UserCard from '../Content_Components/UserCard'
import ClassMenu from '../Classroom_Components/ClassMenu'
import Drawer from '../Classroom_Components/Drawer'
import { withStyles } from '@material-ui/core/styles'
import ParticipantList from './ParticipantList'
import Whiteboard from './Whiteboard'
import {withCookies} from 'react-cookie'
import {compose} from 'redux'
import _ from 'lodash'

const styles = theme => ({ 
    container: {
        display: 'relative',
        height: '900',
        weight: '900',
    }
})

class JoinedLayoutTeacher extends Component {
    ref={}
    state = {
        webcam: {
            // selfWebcam: { owner: "", id: "selfWebcam", zIndex: 3, position: {x: 1130, y: 5}, size: {width: 460, height: 345+72} }, 
            teacherWebcam: { id: "teacherWebcam", zIndex: 3, position: {x: 5, y: 5}, size: {width: 460, height: 345+41} }, 
        },
        whiteboard: {
            teacherWhiteboard: { id: "teacherWhiteboard", user: this.props.joined.owner, zIndex: 2, position: {x: 5, y: 150}, size: {width: 800, height: 718} }, 
        },
        drawer: {
            selfDrawer: { id: "selfDrawer", zIndex: 0, position: {x: 660, y: 5}, size: {width: 450, height: 550} }, 
            classDrawer: { id: "classDrawer", zIndex: 0, position: {x: 0, y: 5} },// to distribute/receive files class esources
        },
        other: {
            PList: { id: "PList", zIndex: 1, position: {x: 465, y: 5}, size: {width: 0, height: 0} }, 
        }
    }

    componentDidUpdate(prevProps) {
        const {session_user} = this.props
        if (!session_user) return
        if (prevProps.session_user === session_user) return
        const diff = _.xor(prevProps.session_user, this.props.session_user)
        if (diff === this.props.self) return

        for (let each of diff) {
            console.log(each)
            if (each === this.props.self) continue
            if (prevProps.session_user.length > this.props.session_user.length) {
                console.log("less")
            } else {
                this.setState({whiteboard: {
                    ...this.state.whiteboard,
                    [each + "Whiteboard"]: { id: each + "Whiteboard", user: each, zIndex: 2, position: {x: 800, y: 150}, size: {width: 800, height: 718} }
                }})
            }
        }

      }

    bringTop = (target) => { // target: selfWebcam/etc
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
        this.ref["selfDrawer"].updatePosition({x: 825, y: 230})
        this.bringTop("selfDrawer")
    }

    saveLayout = () => {
        const {cookies} = this.props
        Object.values(this.state).forEach(outer => {
            Object.values(outer).forEach(inner => {
                cookies.set("layout", {
                    ...this.state,
                    [outer]: {...this.state[outer], inner}
                })
            })
        })
    }

    render() {
        const { classes, ...other } = this.props
        return (
            <Fragment>
                <AppBar position="static" color="default">
                    <Toolbar variant="dense">
                        <ClassMenu {...other} />
                        {Object.keys(this.state).map(
                            (outer) => Object.keys(this.state[outer]).map((inner) => (
                                <Button onClick={()=>this.bringTop(inner)} key={inner}>
                                    {inner}
                                </Button>
                        )))}
                        <Button onClick={()=>this.testfunc()}>update position</Button>
                        <Button onClick={()=>this.saveLayout()}>saveLayout</Button>
                    </Toolbar>
                </AppBar>
                <div className={classes.container}>
                    <ParticipantList 
                        id={"PList"}
                        bringTop={() => this.bringTop('PList')}
                        size={this.state.other["PList"].size}
                        position={this.state.other["PList"].position}
                        zIndex={this.state.other["PList"].zIndex}
                        inputRef={(id, el) => this.ref[id] = el}
                        enableResizing={false}
                        minWidth={0}
                        {...other}/>
                    {Object.values(this.state.webcam).map((webcam) => (
                        <UserCard
                            style={{backgroundColor: 'yellow'}}
                            key={webcam.id}
                            id={webcam.id}
                            bringTop={() => this.bringTop(webcam.id)}
                            size={webcam.size}
                            position={webcam.position} 
                            zIndex={webcam.zIndex}
                            inputRef={(id, el) => this.ref[id] = el} // delete id field (modifly RndContainer as well)
                            lockAspectRatio={4/3}
                            lockAspectRatioExtraHeight={41}
                            {...other}
                            user={(webcam.id === "teacherWebcam") ? 
                                this.props.joined.owner : this.props.self}
                        />
                    ))}
                    {Object.values(this.state.whiteboard).map((whiteboard) => (
                        <Whiteboard
                            key={whiteboard.id}
                            // id={whiteboard.id}
                            bringTop={() => this.bringTop(whiteboard.id)}
                            // size={whiteboard.size}
                            // position={whiteboard.position}
                            // zIndex={whiteboard.zIndex}      
                            inputRef={(id, el) => {this.ref[id] = el; console.log(whiteboard)}}
                            lockAspectRatio={4/3}
                            lockAspectRatioExtraHeight={72}
                            enableResizing={false}
                            {...other}
                            {...whiteboard}
                            // user={(whiteboard.id === "teacherWebcam") ? whiteboard.owner: this.props.self }   
                        />
                    ))}
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

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
)(JoinedLayoutTeacher)