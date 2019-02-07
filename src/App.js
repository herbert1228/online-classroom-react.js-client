import React, {Fragment} from 'react'
import {compose} from 'redux'
import {Content, Classroom, ClassList, Notebooks, Mailbox, NotificationBar} from './Components'
import PropTypes, {instanceOf} from 'prop-types'
import {Cookies, withCookies} from 'react-cookie'
import {withStyles} from '@material-ui/core'
import DrawerLeft from './Components/DrawerLeft'
import './css/App.css'
import Login from './Login'
import { connect } from 'react-redux'
import {store} from './index'
import { connection as conn } from './interface/connection'
import {drawerWidth} from './Components/index'

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: "100vh", //100% after adding more components
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    content: {
        // flexGrow: 1,
        // display: 'flex',
        // justifyContent: 'flex-start',
        float: 'left',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 5,
        paddingLeft: 20,
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        minWidth: 0, // So the Typography noWrap works
    },
})

class App extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    }

    state = {
        showNotification: false,
        notificationMessage: "",
        otherId: null,
    }

    notificationQueue = []

    message = (e) => {
            // if (leave_class){
            // this.props.handleNotification("leave_class success")
            // this.setState({session_user: [], joined: null}) //TODO 
            // }
            // case "get_session_user":
            //     this.setState({session_user: event.session_user})
            //     break
    }

    changeScene(target) {
        if (this.state.joined && target !== 1) {
            // should stop pc instead of leaving the classroom
            conn.call(
                "leave_class", 
                {owner: this.state.joined.owner, class_name: this.state.joined.class_name})
                .then(res => {
                    if (res.type !== "ok") throw new Error("invalid leave_class")
                })
        }
        store.dispatch({type: "changeLocation", target})
        const {cookies} = this.props
        cookies.set("location", target)
    }

    handleNotification = (message) => {
        this.notificationQueue.push(message)
        if (this.state.showNotification) {
            this.setState({ showNotification: false });
        } else {
            this.processQueue();
        }
    }

    processQueue = () => {
        if (this.notificationQueue.length > 0) {
            this.setState({
                notificationMessage: this.notificationQueue.shift(),
                showNotification: true,
            })
        }
    }

    handleDismissNotification = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        this.setState({ showNotification: false });
    }

    render() {
        const {classes, ...others} = this.props
        return (
            <Fragment>
                <NotificationBar
                            message={this.state.notificationMessage}
                            open={this.state.showNotification}
                            handleClose={this.handleDismissNotification.bind(this)}
                            handleExited={this.processQueue}/>
                {(this.props.self) &&
                    <div className={classes.root}>
                        <DrawerLeft
                            open={this.state.open}
                            changeScene={this.changeScene.bind(this)}
                            location={this.props.location}
                            handleNotification={this.handleNotification}
                            {...others}
                        />
                        <div className={classes.content}>
                            {this.props.location === 0 &&<Content {...this.state} {...others} handleNotification={this.handleNotification}/>}
                            {this.props.location === 1 &&<Classroom {...this.state} {...others} handleNotification={this.handleNotification} changeScene={this.changeScene.bind(this)}/>}
                            {this.props.location === 2 &&<ClassList {...this.state} {...others} handleNotification={this.handleNotification} changeScene={this.changeScene.bind(this)}/>}
                            {this.props.location === 3 &&<Notebooks {...this.state} {...others} handleNotification={this.handleNotification}/>}
                            {this.props.location === 4 &&<Mailbox {...this.state} {...others} handleNotification={this.handleNotification}/>}
                        </div>
                    </div>
                }
                {(!this.props.self) &&
                    <Login handleNotification={this.handleNotification}/>
                }
            </Fragment>
            //TODO add loading animation here
        )
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
    return {
        createdClass: state.createdClass,
        enrolledClass: state.enrolledClass,
        startedClass: state.startedClass,
        session_user: state.session_user,
        location: state.location,
        self: state.self,
        joined: state.joined,
        peerConn: state.peerConn
    }
}

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps)
)(App)