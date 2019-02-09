import React, { Component } from 'react'
import { AppBar, Toolbar, Button } from '@material-ui/core'
import UserCard from '../Content_Components/UserCard'
import ClassMenu from '../Classroom_Components/ClassMenu'
import Drawer from '../Classroom_Components/Drawer'
import { withStyles } from '@material-ui/core/styles'
import ParticipantList from './ParticipantList'

const styles = theme => ({})

class JoinedLayout extends Component {
    state = {
        zSelf: 2, zTeacher: 2, zPList: 1, zDrawer: 0
    }
    bringTop(target) {
        const tmpStateObj = {}
        tmpStateObj[target] = Math.max(...Object.values(this.state)) + 1
        this.setState(tmpStateObj)
    }
    render() {
        console.log(Object.keys(this.state))
        const { classes, ...other } = this.props
        return (
            <div>
                <AppBar position="static" color="default">
                    <Toolbar variant="dense">
                        <ClassMenu {...other} />
                        {Object.keys(this.state).map((key) => (
                            <Button onClick={()=>this.bringTop(key)}>
                                {key.substr(1)}
                            </Button>
                        ))}
                    </Toolbar>
                </AppBar>
                <ParticipantList bringTop={() => this.bringTop('zPList')} zIndex={this.state.zPList}/>
                <UserCard
                    bringTop={() => this.bringTop('zTeacher')}
                    position={{x: 200, y: 100}} 
                    zIndex={this.state.zTeacher}
                    key={"Teacher"} 
                    {...other} 
                    user={"Teacher"}/>                    
                <UserCard 
                    bringTop={() => this.bringTop('zSelf')}
                    position={{x: 800, y: 100}}
                    zIndex={this.state.zSelf}      
                    key={this.props.self} 
                    {...other} 
                    user={this.props.self} />  
                <Drawer 
                    bringTop={() => this.bringTop('zDrawer')}
                    position={{x: 500, y: 350}}
                    zIndex={this.state.zDrawer}
                    {...other} />
            </div>
        )
    }
}

export default withStyles(styles)(JoinedLayout)