import React from 'react';
// import ReactDOM from 'react-dom'
import App from './client/App';
import registerServiceWorker from './registerServiceWorker';
import './client/css/index.css' //TODO margin: 8 without css
// import Game from './client/Game';
// import Test from './client/test';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import {blueGrey, amber} from '@material-ui/core/colors'

let ReactDOM = require('react-dom');

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
            <App/>
        </MuiThemeProvider>
    )
}

// ReactDOM.render(<Test />, document.getElementById('root'));
ReactDOM.render(<Index />, document.getElementById('root'));

registerServiceWorker();
