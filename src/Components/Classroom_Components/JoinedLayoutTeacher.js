import React, { Component, Fragment } from 'react'
import { AppBar, Toolbar, Button } from '@material-ui/core'
import UserCard from '../Content_Components/UserCard'
import ClassMenu from '../Classroom_Components/ClassMenu'
import Drawer from '../Classroom_Components/Drawer'
import { withStyles } from '@material-ui/core/styles'
import ParticipantList from './ParticipantList'
import Whiteboard from './Whiteboard'
import GroupWhiteboard from './GroupWhiteboard'
import {withCookies} from 'react-cookie'
import {compose} from 'redux'
import _ from 'lodash'
import {store} from '../../index'
import { ClassStatusChannel } from '../../interface/connection';
import FindComponent from './FindComponent';

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
            // selfWebcam: { owner: "", id: "selfWebcam", zIndex: 2, position: {x: 1130, y: 5}, size: {width: 460, height: 345+72} }, 
            teacherWebcam: { id: "teacherWebcam", zIndex: 2, position: {x: 10, y: 5}, size: {width: 460 / 1.5, height: (345+41) / 1.5 + 14.5} }, 
        },
        whiteboard: {
            "Group3Whiteboard": { type: 'group', id: "Group3Whiteboard", user: "Group3", zIndex: 2, position: {x: 810, y: 150}, size: {width: 800, height: 718} },
            "Group2Whiteboard": { type: 'group', id: "Group2Whiteboard", user: "Group2", zIndex: 2, position: {x: 810, y: 150}, size: {width: 800, height: 718} },
            "Group1Whiteboard": { type: 'group', id: "Group1Whiteboard", user: "Group1", zIndex: 2, position: {x: 810, y: 150}, size: {width: 800, height: 718} },
            teacherWhiteboard: { id: "teacherWhiteboard", user: this.props.joined.owner, zIndex: 3, position: {x: 10, y: 150}, size: {width: 800, height: 718} }, 
        },
        drawer: {
            selfDrawer: { id: "selfDrawer", zIndex: 0, position: {x: 660, y: 5}, size: {width: 450, height: 550} }, 
            // classDrawer: { id: "classDrawer", zIndex: 0, position: {x: 0, y: 5} },// to distribute/receive files class esources
        },
        other: {
            PList: { id: "PList", zIndex: 1, position: {x: 1450, y: 5}, size: {width: 0, height: 0} }, 
        }
    }

    async componentDidMount() {
        const groupCards = (await ClassStatusChannel.getGroups()).result
        const groupedStudents = groupCards.map(card => card.id)

        const {session_user} = this.props
        if (!session_user) return
        for (let each of session_user) {
            if (each !== this.props.joined.owner && !groupedStudents.includes(each)){
                groupCards.push({id: each, name: each, status: 'All'})
            }

            if (each === this.props.self) continue
            this.setState({whiteboard: {
                ...this.state.whiteboard,
                [each + "Whiteboard"]: { id: each + "Whiteboard", user: each, zIndex: 2, position: {x: 820, y: 150}, size: {width: 800, height: 718} }
            }})
        }

        console.warn(groupCards)
        store.dispatch({type: "updateGroupCards", groupCards})
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
                console.log("less")
                this.props.handleNotification(each + " left")
                removeUserFromGroupCards(each, this.props)

                const tmpState = this.state
                delete tmpState.whiteboard[each + "Whiteboard"]
                this.setState(tmpState)
            } else {
                this.props.handleNotification(each + " joined")
                insertUserToGroupCards(each, this.props)

                this.setState({whiteboard: {
                    ...this.state.whiteboard,
                    [each + "Whiteboard"]: { id: each + "Whiteboard", user: each, zIndex: 2, position: {x: 810, y: 150}, size: {width: 800, height: 718} }
                }})
            }
        }
    }

    componentWillUnmount() {
        resetGroupCards()
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
        this.ref["PList"].updatePosition({x: 825, y: 230})
        this.bringTop("PList")
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
                        <FindComponent components={this.state} bringTop={this.bringTop}/>
                        <Button onClick={()=>this.testfunc()}>Find Student List</Button>
                        {/* <Button onClick={()=>this.saveLayout()}>saveLayout</Button> */}
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
                    {Object.values(this.state.whiteboard).map((whiteboard) => {
                        if (whiteboard.type !== 'group') {
                            return (
                                <Whiteboard
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
                        }
                        else if (whiteboard.type === 'group' && hasGroup(whiteboard.user, this.props))
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
                    {/* {Object.values(this.state.whiteboard).map((whiteboard) => (
                        <Whiteboard
                            key={whiteboard.id}
                            bringTop={() => this.bringTop(whiteboard.id)}
                            inputRef={(id, el) => this.ref[id] = el}
                            lockAspectRatio={4/3}
                            lockAspectRatioExtraHeight={72}
                            enableResizing={false}
                            {...whiteboard}
                            {...other}
                        />
                    ))} */}
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

function insertUserToGroupCards(user, props, ...defaultGroupCards) {
    if (user === props.joined.owner) return
    let {groupCards} = props
    // if (defaultGroupCards) {
    //     groupCards = defaultGroupCards
    // }
    groupCards.push({id: user, name: user, status: 'All'})
    store.dispatch({type: "updateGroupCards", groupCards})
}

function removeUserFromGroupCards(user, props) {
    const {groupCards} = props

    const targetIndex = groupCards.findIndex(c => (user === c.id))

    groupCards.splice(targetIndex, 1)

    store.dispatch({type: "updateGroupCards", groupCards})
}

function resetGroupCards() {
    store.dispatch({type: "updateGroupCards", groupCards: []})
}

function hasGroup(groupId, props) {
    return props.groupCards.filter(group => group.status === groupId).length > 0
}

// function getGroupMembers(groupId, props) {
//     return props.groupCards.filter(group => group.status === groupId).
// }

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
)(JoinedLayoutTeacher)