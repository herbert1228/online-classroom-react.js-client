import React from 'react';
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import {Grid, Card, CardHeader,
        Divider, Button, ExpansionPanel,
        ExpansionPanelDetails, ExpansionPanelSummary} from '@material-ui/core'
import {Settings, ExpandMore} from '@material-ui/icons'
import CreateClass from './PopupFunction/CreateClass'
import EnrollClass from './PopupFunction/EnrollClass'
import {connection as conn} from '../../interface/connection'
import {store} from '../../index'

const styles = theme => ({
    card: {
        position: 'relative',
        left: 50,
        width: `calc(100% - 100px)`,
        minWidth: 800,
        minHeight: 500,
        paddingTop: 10,
        paddingBottom: 50,
        paddingLeft: 10,
        marginBottom: 10,
        overflowY: "auto" //TODO 'auto' || 'scroll'
    },
    inner_grid: {
        paddingLeft: 20,
        paddingTop: 30
    },
    list: {
        paddingLeft: 20,
        paddingTop: 5
    },
    divider: {
        paddingLeft: 20,
        marginBottom: 10,
        width: "100%"
    },
    ex_root: {
        width: "90%",
        paddingLeft: "5%"
    },
    expand_heading: {
        fontSize: theme.typography.pxToRem(16),
        flexBasis: '30%',
        flexShrink: 0,
        overflow: "hidden",
        marginTop: 10
    },
    expand_secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    },
    expand_secondaryHeading_green: {
        fontSize: theme.typography.pxToRem(15),
        color: 'rgba(99, 214, 70)',
    }
});

class ClassList extends React.Component {
    state = {expanded: null, expandedEnroll: null}

    handleChange = panel => (event, expanded) => {
        this.setState({
            expanded: expanded ? panel : false,
        })
    }

    handleChangeEnroll = panel => (event, expanded) => {
        this.setState({
            expandedEnroll: expanded ? panel : false,
        })
    }

    async joinClass(owner, class_name) {
        const response = await conn.call("join_class", {owner, class_name})
        if (response.type === "ok") {
            store.dispatch({type: "joinClass", owner, class_name: class_name})
            this.props.handleNotification(`join ${owner}'s class: ${class_name} success`)
            this.props.changeScene(1)
        }
        if (response.type === "reject") {
            this.props.handleNotification(`join class failed, reason: ${response.reason}`)
        }
    }

    async startClass(class_name) {
        const response = await conn.call("start_class", {class_name})
        if (response.type === "ok") {
            this.props.handleNotification("start class success")
        }
        if (response.type === "reject") {
            this.props.handleNotification(response.reason)
        }
    }

    isStarting(owner, class_name) {
        return this.props.startedClass.find(obj => (obj.owner === owner && obj.class_name === class_name)) !== undefined
    }

    render() {
        const { classes, self, ...other } = this.props
        const { expanded, expandedEnroll } = this.state
        return (
            <main className={classes.content}>
                {/* <Grid
                    container
                    justify="flex-start"
                    direction="column"
                    alignItems="center"
                > */}
                    <Card className={classes.card}>
                        <CardHeader //this height is 74px
                            title={"Class List"}
                            subheader={"see your created and enrolled class here"}
                        />
                        <Grid
                              container
                              direction="row"
                              justify="space-evenly"
                              alignItems="flex-start"
                        >
                            <Grid item>
                                <CreateClass {...other}/>
                            </Grid>
                            <Grid item>
                                <EnrollClass {...other}/>
                            </Grid>
                        </Grid>

                        {/*Created Class*/}
                        <Grid className={classes.inner_grid} container direction="column" alignItems="flex-start" justify="flex-start">
                            <Grid item>
                                <Typography variant="subheading">Created Class</Typography>
                            </Grid>
                        </Grid>
                        <Divider className={classes.divider}/>
                        <div className={classes.ex_root}>
                        {
                            (this.props.createdClass.length > 0) ?
                                this.props.createdClass.map((c, index) => (
                                            <ExpansionPanel
                                                key={index} expanded={expanded === index}
                                                onChange={this.handleChange(index)}
                                                // classes={this.isStarting(self, c) && {root: classes.root}}
                                            >
                                                <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                                                    <Typography className={classes.expand_heading}>{c}</Typography>
                                                    <div>
                                                        {this.isStarting(self, c) ?
                                                            <Typography
                                                                className={classes.expand_secondaryHeading_green}
                                                            >Status: Starting</Typography> :
                                                            <Typography
                                                                className={classes.expand_secondaryHeading}
                                                            >Status: ready</Typography>
                                                        }
                                                        <Typography
                                                            className={classes.expand_secondaryHeading}
                                                        >Student No: 0/5</Typography>
                                                    </div>
                                                </ExpansionPanelSummary>
                                                <ExpansionPanelDetails>
                                                    <Button variant="outlined"
                                                            onClick={() => this.startClass(c)}
                                                            disabled={this.isStarting(self, c)}
                                                    >Start</Button>
                                                    <Button variant="outlined"
                                                            onClick={() => this.joinClass(self, c)}
                                                            disabled={!this.isStarting(self, c)}
                                                    >Enter</Button>
                                                    <Button variant="outlined">Students</Button>
                                                    <Button variant="outlined"><Settings/></Button>
                                                </ExpansionPanelDetails>
                                            </ExpansionPanel>
                                )) :
                                <Typography variant="body1">No Created Class</Typography>
                        }
                        </div>

                        {/*Enrolled Class*/}
                        <Grid className={classes.inner_grid} container direction="column" alignItems="flex-start" justify="flex-start">
                            <Grid item>
                                <Typography variant="subheading">Enrolled Class</Typography>
                            </Grid>
                        </Grid>
                        <Divider className={classes.divider}/>
                        <div className={classes.ex_root}>
                        {
                            (this.props.enrolledClass.length > 0) ?
                                this.props.enrolledClass.map((en, index) => (
                                    <ExpansionPanel key={index} expanded={expandedEnroll === index} onChange={this.handleChangeEnroll(index)}>
                                        <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                                            <Typography className={classes.expand_heading}>{en.class_name} (teacher: {en.owner})</Typography>
                                            <div>
                                                {this.isStarting(en.owner, en.class_name) ?
                                                    <Typography
                                                        className={classes.expand_secondaryHeading_green}
                                                    >Status: Starting</Typography> :
                                                    <Typography
                                                        className={classes.expand_secondaryHeading}
                                                    >Status: ready</Typography>
                                                }
                                                <Typography
                                                    className={classes.expand_secondaryHeading}
                                                >Student No: 0/5</Typography>
                                            </div>
                                        </ExpansionPanelSummary>
                                        <ExpansionPanelDetails>
                                            {/*Should not join a not started class*/}
                                            <Button variant="outlined"
                                                    onClick={() => this.joinClass(en.owner, en.class_name)}
                                                    disabled={!this.isStarting(en.owner, en.class_name)}
                                            >Enter</Button>
                                            <Button variant="outlined"><Settings/></Button>
                                        </ExpansionPanelDetails>
                                    </ExpansionPanel>
                                )) :
                                <Typography variant="body1">No Enrolled Class</Typography>
                        }
                        </div>
                    </Card>
                {/* </Grid> */}
            </main>
        )
    }
}

ClassList.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ClassList);