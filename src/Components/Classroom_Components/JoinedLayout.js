import React, { Component, Fragment } from 'react'
import { AppBar, Toolbar, Button } from '@material-ui/core'
import UserCard from '../Content_Components/UserCard'
import ClassMenu from '../Classroom_Components/ClassMenu'
import Drawer from '../Classroom_Components/Drawer'
import { withStyles } from '@material-ui/core/styles'
import ParticipantList from './ParticipantList'
import Whiteboard from './Whiteboard';

const styles = theme => ({
    container: {
        display: 'relative',
        height: '900',
        weight: '900',
    }
})

class JoinedLayout extends Component {
    ref={}
    state = {
        webcam: {
            selfWebcam: { zIndex: 3, position: {x: 950, y: 50} }, 
            teacherWebcam: { zIndex: 3, position: {x: 200, y: 50} }, 
        },
        whiteboard: {
            teacherWhiteboard: { zIndex: 2, position: {x: 100, y: 400} }, 
            selfWhiteboard: { zIndex: 2, position: {x: 300, y: 400} },
        },
        drawer: {
            selfDrawer: { zIndex: 0, position: {x: 850, y: 320} }, 
            classDrawer: { zIndex: 0, position: {x: 850, y: 50} },// to distribute/receive files class esources
        },
        other: {
            PList: { zIndex: 1, position: {x: 0, y: 50} }, 
        }
    }
    bringTop(target) {
        let maxZ = -1
        for (var outter of this.state) {
            for (var inner of outter) {
                if (inner.zIndex > maxZ) maxZ = inner.zIndex
            }
        }
        outter = this.findKeyInNestedObject(target)
        this.setState({
            [outter]: {
                ...this.state[outter], 
                [target]: {...this.state[outter][target], zIndex: maxZ + 1}
            }
        })
    }
    updatePosition = (id, position) => {
        for (let s of this.state) {
            console.log(s)
        }
        // this.setState({position: {...this.state.position, [id]: position}})
    }
    findKeyInNestedObject = (key) => {
        Object.keys(this.state).forEach(k => {
            this.state[k].includes(key)
            return k
        })
    }
    testfunc = () => {
        this.ref.selfWebcam.updatePosition({x: 500, y: 500})
    }
    render() {
        const { classes, ...other } = this.props
        return (
            <Fragment>
                <AppBar position="static" color="default">
                    <Toolbar variant="dense">
                        <ClassMenu {...other} />
                        {Object.keys(this.state.zIndex).map((key) => (
                            <Button onClick={()=>this.bringTop(key)} key={key}>
                                {key}
                            </Button>
                        ))}
                        <Button onClick={()=>this.testfunc()}>update position</Button>
                    </Toolbar>
                </AppBar>
                <div className={classes.container}>
                    <ParticipantList 
                        {...other}
                        bringTop={() => this.bringTop('PList')}
                        position={this.state.other.PList.position}
                        zIndex={this.state.zIndex.PList}/>
                    {/* this.state.webcam.map() */}
                    <UserCard // add key if use map func
                        id={"teacherWebcam"}
                        bringTop={() => this.bringTop('teacherWebcam')}
                        position={this.state.position["teacherWebcam"]} 
                        zIndex={this.state.zIndex.teacherWebcam}
                        inputRef={(id, el) => this.ref[id] = el}
                        {...other} 
                        user={"Teacher"}/>                    
                    <UserCard 
                        id={"selfWebcam"}
                        bringTop={() => this.bringTop('selfWebcam')}
                        position={this.state.position["selfWebcam"]}
                        zIndex={this.state.zIndex["selfWebcam"]} 
                        inputRef={(id, el) => this.ref[id] = el}
                        {...other} 
                        user={this.props.self} />
                    <Whiteboard
                        id={"teacherWhiteboard"}
                        key={"teacherWhiteboard"}
                        bringTop={() => this.bringTop('teacherWhiteboard')}
                        position={this.state.position["teacherWhiteboard"]}
                        zIndex={this.state.zIndex.teacherWhiteboard}      
                        {...other}
                        user={"Teacher"} />
                    <Whiteboard
                        id={"selfWhiteboard"}
                        bringTop={() => this.bringTop('selfWhiteboard')}
                        position={this.state.position["selfWhiteboard"]}
                        zIndex={this.state.zIndex.selfWhiteboard}      
                        {...other}
                        user={this.props.self} />
                    <Drawer 
                        bringTop={() => this.bringTop('Drawer')}
                        position={this.state.drawer["selfDrawer"]}
                        zIndex={this.state.zIndex.Drawer}
                        {...other} />
                </div>
            </Fragment>
        )
    }
}

export default withStyles(styles)(JoinedLayout)