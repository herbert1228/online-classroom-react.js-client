import React from 'react';
import App from './App'
import Upload from './Components/Locations/Upload'
import registerServiceWorker from './registerServiceWorker';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles'
import {amber, blueGrey} from '@material-ui/core/colors'
import {BrowserRouter as Router, Route} from "react-router-dom"

import ReactDOM from 'react-dom'

let themeType = 'light';

const theme = createMuiTheme({
    palette: {
        primary: {main: blueGrey[800]},
        secondary: amber,
        type: themeType
    }
});

function Index() {
    return (
        <MuiThemeProvider theme={theme}>
            <Router>
                <div>
                    <Route path="/" exact component={props => <App/>}/>
                    <Route path="/upload" exact component={props => <Upload/>}/>
                </div>
            </Router>
            {/* <App/> */}
        </MuiThemeProvider>
    )
}

// ReactDOM.render(<Test />, document.getElementById('root'));
ReactDOM.render(<Index/>, document.getElementById('root'));

registerServiceWorker();
