import React from 'react';
import App from './App'
import Upload from './Components/Locations/Upload'
import registerServiceWorker from './registerServiceWorker';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles'
import {amber, blueGrey} from '@material-ui/core/colors'
import {BrowserRouter as Router, Route} from "react-router-dom"
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import ReactDOM from 'react-dom'
import { connection as conn } from './interface/connection'

let themeType = 'light';

const theme = createMuiTheme({
    palette: {
        primary: {main: blueGrey[800]},
        secondary: amber,
        type: themeType
    }
})

const initialState = {
    createdClass: [],
    enrolledClass: [], // class_name, owner, online and offline students number of every class
    startedClass: [],
    session_user: [], // user currently in the same class
    peerConn: [],   // session_user who is ready for peer connection (as webcam turned on)
    location: 0,
    self: null,
    joined: null,
    drawerOpen: true
}

function reducer(state = initialState, action) {
    // console.log(action)
    switch(action.type) {
        case "get_created_class":
            return {...state, createdClass: action.result}
        case "get_enrolled_class":
            return {...state, enrolledClass: action.result}
        case "get_started_class":
            return {...state, startedClass: action.result}
        case "get_session_user":
            return {...state, session_user: action.result}
        case "get_exist_peer_conn":
            return {...state, peerConn: action.result}
        case "changeLocation":
            return {...state, location: action.target}
        case "logout":
            return {...state, self: null, joined: null}
        case "login":
            return {...state, self: action.loginName}
        case "joinClass":
            return {...state, joined: {owner: action.owner, class_name: action.class_name}}
        case "leaveClass":
            return {...state, joined: null, session_user: []}
        case "drawerOpen":
            return {...state, drawerOpen: action.drawerOpen}
        default: 
            return state
    }
}

export const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

class Index extends React.Component {
    componentDidMount() {
        conn.connect()
        conn.addListener("socketclose", this.handleSocketClose)
        conn.addListener("get_started_class", (e) => this.dispatch("get_started_class", e.result))
        conn.addListener("broadcast_message", (e) => console.log(e.result))
        conn.addListener("get_session_user", (e) => this.dispatch("get_session_user", e.result))
        conn.addListener("get_exist_peer_conn", (e) => this.dispatch("get_exist_peer_conn", e.result))
    }

    dispatch = (type, result) => {
        store.dispatch({type, result})
    }

    handleSocketClose = () => {
        //TODO relogin here
        console.log("attempting to reconnect...")
        setTimeout(() => {
            store.dispatch({type: "logout"}) //TODO error: cannot set self to null
            conn.connect()
        }, 2000)
        this.setState({joined: null})
    }

    render() {
        return (
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <Router>
                        <div>
                            <Route path="/" exact component={props => <App/>}/>
                            <Route path="/upload" exact component={props => <Upload/>}/>
                        </div>
                    </Router>
                    {/* <App/> */}
                </MuiThemeProvider>
            </Provider>
        )
    }
}

ReactDOM.render(<Index/>, document.getElementById('root'));

registerServiceWorker();
