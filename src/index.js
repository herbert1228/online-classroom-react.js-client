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
// import { connection as conn } from './interface/connection'

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
    enrolledClass: [],
    startedClass: [],
    session_user: [],
    location: 0,
    self: null,
    joined: null,
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
        case "changeLocation":
            return {...state, location: action.target}
        case "logout":
            return {...state, self: null}
        case "login":
            return {...state, self: action.loginName}
        case "joinClass":
            return {...state, joined: {owner: action.owner, class_name: action.class_name}}
        default: 
            return state
    }
}

export const store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

function Index() {
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

// ReactDOM.render(<Test />, document.getElementById('root'));
ReactDOM.render(<Index/>, document.getElementById('root'));

registerServiceWorker();
