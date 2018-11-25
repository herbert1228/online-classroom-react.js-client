import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {AppBar, Avatar, Chip, Grid, Tab, Tabs, TextField, Typography} from '@material-ui/core';
import 'whatwg-fetch'
import {drawerWidth} from "../index";

function TabContainer(props) {
    return (
        <Typography component="div" style={{ padding: 8 * 3 }}>
            {props.children}
        </Typography>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
};

const styles = theme => ({
    root: {
        flexGrow: 1,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    appbar: {
        position: "fixed",
        top: 65,
        right: 0,
        width: drawerWidth,
    },
    tab: {
        // fontSize: 5,
    },
    grid: {
        paddingTop: 60,
        padding: 18,
        height: "100%"
    },
    chip: {
        marginTop: 18,
    },
    textField: {
        padding: 10,
        paddingTop: 0,
        position: "fixed",
        bottom: '0',
        background: "white"
    },
    span: {
        fontSize: 10,
        display: "block"
    }
});

class ScrollableTabsButtonAuto extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoading: true,
            resources: [],
            value: 0,
            comment: ''
        }
    }

    handleChange = (event, value) => {
        this.setState({ value });
    };

    handleComment(e) {
        this.setState({ comment: e.target.value });
    };

    // async keyPressPassword(e) {
    keyPress(e) {
        // console.log(e.cancelable);
        if(e.keyCode === 13){
            e.preventDefault();
            // await this.uploadChatFromApi();
            // await this.getChatFromApi();
            // console.log("fetched")
            // console.log("uploaded")
            this.setState({comment: ''});
            if (this.props.self == null){ return}
            let message = {
                name: 'user chat',
                data: {
                    // id: '1',
                    user: this.props.self,
                    content: this.state.comment,
                    time: this.getTime()
                }
            };
            this.props.ws.send(JSON.stringify(message));
        }
    }

    getTime() {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let today = new Date();
        let dd = today.getDate();
        let MM = monthNames[today.getMonth()];
        let hh = today.getHours();
        let mm = today.getMinutes();
        // if (dd < 10){dd="0"+dd}
        if (hh < 10){hh="0"+hh}
        if (mm < 10){mm="0"+mm}
        return hh + ":" + mm + " " + dd + "/" + MM;
    }

    render() {
        const { classes } = this.props;
        const { value } = this.state;

        return (
            <div className={classes.root}>
                <AppBar color="default" className={classes.appbar}>
                    <Tabs
                        value={value}
                        onChange={this.handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        scrollable
                        scrollButtons="auto"
                    >
                        <Tab label={<span className={classes.tab}>Chat</span>} />
                        <Tab label="Two" />
                        <Tab label="Item Three" />
                    </Tabs>
                </AppBar>
                <Grid
                    container
                    direction="column"
                    justify="flex-start"
                    alignItems="flex-start"
                    className={classes.grid}
                >
                    {
                        (this.props.chat != null) ?
                            value === 0 &&
                            this.props.chat.map((res, index) => (
                                <div className={classes.chip} key={index}>
                                    <Chip
                                        avatar={<Avatar>{res.user.substring(0,3)}</Avatar>}
                                        // label={res.content}
                                        label={<ChipContent res={res}/>}
                                        // className={classes.chip}
                                    />
                                </div>
                            )) :
                            value === 0 && <TabContainer>Comment Something Here</TabContainer>
                    }
                    {value === 1 && <TabContainer>Item Two</TabContainer>}
                    {value === 2 && <TabContainer>Item Three</TabContainer>}
                </Grid>
                <form className={classes.textField}>
                    <TextField
                        label="Comment"
                        // value="Comment Here"
                        value={this.state.comment}
                        onChange={this.handleComment.bind(this)}
                        onKeyDown={this.keyPress.bind(this)}
                    />
                </form>
            </div>
        );
    }
}

function ChipContent(props) {
    const {res} = props;
    return (
        <div style={{position: "relative"}}>
            <div>{res.content}</div>
            <div style={{fontSize: 6}}>
                {res.time}
            </div>
        </div>
    )
}


ScrollableTabsButtonAuto.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ScrollableTabsButtonAuto);

// async getChatFromApi() {
//     const request = fetch('http://localhost:8080/api/chat')
//     const repsonse = await request
//     const json = await repsonse.json();
//
//     this.setState({
//         resources: json,
//         isLoading: false
//     });
// }

// uploadChatFromApi() {
//     // const url = 'http://herbert.dynu.net:8080/api/chat';
//     const url = 'http://localhost:8080/api/chat';
//     return fetch(url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//             // id: '1',
//             user: 'Dev',
//             content: this.state.comment,
//             time: this.getTime()
//         })
//     })
//         .then(function (response) {
//             console.log("finished upload")
//             console.log(response.url);
//         })
//         .catch(function (error) {
//             console.log(error.message)
//         });
//
// }
//
// componentWillMount() {
//     this.getChatFromApi();
// }