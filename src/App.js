import React, {Fragment} from 'react'
import {compose} from 'redux'
import {Content, Classroom, Notebooks, Mailbox, NotificationBar} from './Components'
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
import ClassListStudent from './Components/Locations/ClassListStudent';
import ClassListTeacher from './Components/Locations/ClassListTeacher';

const styles = theme => ({
    root: {
        height: "100vh", //100% after adding more components
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    content: {
        backgroundColor: theme.palette.background.default,
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        minWidth: 0, // So the Typography noWrap works
        display: 'relative'
    }
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

    changeScene = async (target) => {
        if (this.props.joined && this.props.location === 1) {
            const response = await conn.call("leave_class")
            if (response.type === "ok") {
                store.dispatch({type: "leaveClass"})
                this.handleNotification("leave_class success")
            } else throw new Error("invalid action: leave class")
        }
        store.dispatch({type: "changeLocation", target})
        this.props.cookies.set("location", target)
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
                        {this.props.drawerOpen &&
                            <DrawerLeft
                                open={this.state.open}
                                changeScene={this.changeScene}
                                location={this.props.location}
                                handleNotification={this.handleNotification}
                                {...others}
                            />
                        }
                        <div className={classes.content}>
                            {this.props.location === 0 &&<Content {...this.state} {...others} handleNotification={this.handleNotification}/>}
                            {this.props.location === 1 &&<Classroom {...this.state} {...others} handleNotification={this.handleNotification} changeScene={this.changeScene}/>}
                            {/* {this.props.location === 2 &&<ClassList {...this.state} {...others} handleNotification={this.handleNotification} changeScene={this.changeScene}/>} */}
                            {this.props.location === 2.1 &&<ClassListTeacher {...this.state} {...others} handleNotification={this.handleNotification} changeScene={this.changeScene}/>}
                            {this.props.location === 2.2 &&<ClassListStudent {...this.state} {...others} handleNotification={this.handleNotification} changeScene={this.changeScene}/>}
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
        peerConn: state.peerConn,
        drawerOpen: state.drawerOpen,
        lastJoin: state.lastJoin
    }
}

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps)
)(App)