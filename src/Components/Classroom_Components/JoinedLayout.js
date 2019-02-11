import React, { Component } from 'react'
import { AppBar, Toolbar, Button } from '@material-ui/core'
import UserCard from '../Content_Components/UserCard'
import ClassMenu from '../Classroom_Components/ClassMenu'
import Drawer from '../Classroom_Components/Drawer'
import { withStyles } from '@material-ui/core/styles'
import ParticipantList from './ParticipantList'
import Whiteboard from './Whiteboard';

const styles = theme => ({
    container: {
        height: '900',
        weight: '900',
    }
})

class JoinedLayout extends Component {
    state = {
        zSelf: 3, zTeacher: 3, zPList: 1, zDrawer: 0, zWhiteboard: 2
    }
    bringTop(target) {
        const tmpStateObj = {}
        tmpStateObj[target] = Math.max(...Object.values(this.state)) + 1
        this.setState(tmpStateObj)
    }
    render() {
        const { classes, ...other } = this.props
        return (
            <div>
                <div>
                    <AppBar position="static" color="default">
                        <Toolbar variant="dense">
                            <ClassMenu {...other} />
                            {Object.keys(this.state).map((key) => (
                                <Button onClick={()=>this.bringTop(key)} key={key}>
                                    {key.substr(1)}
                                </Button>
                            ))}
                        </Toolbar>
                    </AppBar>
                </div>
                <div>
                    <ParticipantList 
                        {...other}
                        bringTop={() => this.bringTop('zPList')} 
                        zIndex={this.state.zPList}/>
                    <UserCard
                        bringTop={() => this.bringTop('zTeacher')}
                        position={{x: 200, y: 50}} 
                        zIndex={this.state.zTeacher}
                        key={"Teacher"} 
                        {...other} 
                        user={"Teacher"}/>                    
                    <UserCard 
                        bringTop={() => this.bringTop('zSelf')}
                        position={{x: 950, y: 50}}
                        zIndex={this.state.zSelf}      
                        key={this.props.self} 
                        {...other} 
                        user={this.props.self} />
                    <Whiteboard
                        bringTop={() => this.bringTop('zWhiteboard')}
                        position={{x: 100, y: 400}}
                        zIndex={this.state.zWhiteboard}      
                        {...other}
                        user={"Teacher"} />
                    <Drawer 
                        bringTop={() => this.bringTop('zDrawer')}
                        position={{x: 850, y: 320}}
                        zIndex={this.state.zDrawer}
                        {...other} />
                </div>
            </div>
        )
    }
}

export default withStyles(styles)(JoinedLayout)