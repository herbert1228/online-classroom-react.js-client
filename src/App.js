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
import { connection as conn } from './interface/connection'

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: "100vh", //100% after adding more components
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
    },
    flex: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    }
})

class App extends React.Component {
    static propTypes = {
        cookies: instanceOf(Cookies).isRequired
    }

    state = {
        joined: null,
        showNotification: false,
        notificationMessage: "",
        otherId: null,
        peerConn: null
    }

    notificationQueue = []

    message = (e) => {
        const event = JSON.parse(e.data)
        switch (event.type) {
            case "register_success":
                this.handleNotification("registered")
                break
            case "register_failed":
                this.handleNotification("register failed")
                break
            case "get_created_class":
                this.setState({createdClass: event.created_classes})
                break
            case "get_subscribed_class":
                this.setState({enrolledClass: event.subscribed_class})
                break
            case "create_class_success":
                this.ws.send(JSON.stringify({type: "get_created_class"}))
                this.ws.send(JSON.stringify({type: "get_subscribed_class"}))
                this.handleNotification("created class success")
                break
            case "create_class_failed":
                this.handleNotification("created class failed")
                break
            case "join_class success":
                this.handleNotification(`join ${event.owner}'s class: ${event.class_name} success`)
                this.setState({joined: {owner: event.owner, class_name: event.class_name}}, () => this.changeScene(1))
                break
            case "join_class failed":
                this.handleNotification("join class failed")
                break
            case "start_class success":
                this.handleNotification("start class success")
                break
            case "start_class failed":
                this.handleNotification("start class failed")
                break
            case "subscribe_class success":
                this.ws.send(JSON.stringify({type: "get_subscribed_class"}))
                this.ws.send(JSON.stringify({type: "get_started_class"}))
                this.handleNotification("subscribe " + event.owner + "'s " + event.class_name + " success")
                break
            case "subscribe_class failed":
                this.handleNotification("subscribe " + event.owner + "'s " + event.class_name + " failed")
                break
            case "get_session_user":
                this.setState({session_user: event.session_user})
                break
            case "get_exist_peer_conn":
                this.setState({ peerConn: event.exist_peer_conn })
                break
            case "leave_class success":
                this.handleNotification("leave_class success")
                this.setState({session_user: [], joined: null})
                break
            default:
                break
        }
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
        this.props.dispatch({type: "changeLocation", target})
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
                            handleExited={this.processQueue}
                        />
                {(this.props.self) &&
                    <div className={classes.root}>
                        <DrawerLeft
                            open={this.state.open}
                            changeScene={this.changeScene.bind(this)}
                            location={this.props.location}
                        />
                        {this.props.location === 0 &&<Content {...this.state} {...this.props} />}
                        {this.props.location === 1 &&<Classroom {...this.state} {...this.props} changeScene={this.changeScene.bind(this)}/>}
                        {this.props.location === 2 &&<ClassList {...this.state} {...this.props} changeScene={this.changeScene.bind(this)}/>}
                        {this.props.location === 3 &&<Notebooks {...this.state} {...this.props}/>}
                        {this.props.location === 4 &&<Mailbox {...this.state} {...this.props}/>}
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
        self: state.self
    }
}

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
    connect(mapStateToProps)
)(App)