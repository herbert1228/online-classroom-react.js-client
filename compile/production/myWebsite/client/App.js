import React from 'react'
import {Content, Header} from './Components'
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core'
import DrawerLeft from './Components/DrawerLeft'
import DrawerRight from './Components/DrawerRight'
import './css/App.css'
import 'sockjs-client'

const styles = theme => ({
    root: {
        flexGrow: 1,
        height: "100%", //100% after adding more components
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
    },
});

const url = 'ws://localhost:4000';
// const url = 'ws://192.168.240.61:4000';
// const urlHome = 'ws://herbert.dynu.net:4000';

class App extends React.Component {
    constructor(prop) {
        super(prop);
        this.state = { //TODO !!Safety: can be modified in browser
            open: false,
            connected: false,
            channels: [],
            users: [],
            messages: [],
            activeChannel: {},
            login: false,
            self: null,
            chat: [],
            ws: new WebSocket(url),
        };
        let ws = this.ws = this.state.ws;
        ws.onmessage = this.message.bind(this);
        ws.onopen = this.open.bind(this);
        ws.onclose = () => {this.setState({connected: false}); console.log("ws disconnected");}
    }

    message(e) {
        console.log("onmessage", e)
        const event = JSON.parse(e.data);
        switch (event.name) {
            case 'init':
                this.setState({users: event.data.users, chat: event.data.chat}); break;
            case 'no. login change':
                // this.setState({users: event.data});
                console.log(event.data)
                break;
            case 'Invalid User Name':
                console.log("invalid"); break;
            case 'Successful Login':
                this.setState({login: true, self: event.data}); break;
            case 'new chat':
                this.setState({chat: event.data}); break;
            case 'hostile attack':
                window.alert("Stop attacking"); console.log("stop"); break;
            case 'draw to client':
                this.setState({users: event.data}); break;
            default:
                break;
        }
    }

    open() {
        console.log("ws connected");
        this.setState({connected: true});
        let message = {
            name: 'init',
            data: {}
        };
        this.ws.send(JSON.stringify(message));
    }

    handleDrawer = () => {
        this.setState({open: !this.state.open});
    };

    render() {
        const {classes} = this.props;
        return (
            <div className={classes.root}>
                <Header
                    onClickOpen={() => this.handleDrawer()}
                    {...this.state}
                />
                <DrawerLeft open={this.state.open} onClickClose={() => this.handleDrawer()}/>
                <DrawerRight {...this.state}/>
                <Content {...this.state}/>
            </div>
        )
    }
}

App.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(App);