import React from 'react';
import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import {Grid, Card, CardHeader,
        Divider, Button, ExpansionPanel,
        ExpansionPanelDetails, ExpansionPanelSummary} from '@material-ui/core'
import {Settings, ExpandMore} from '@material-ui/icons'
import EnrollClass from './PopupFunction/EnrollClass'
import {connection as conn} from '../../interface/connection'
import {store} from '../../index'
import ViewClassStudentsInfo from './PopupFunction/ViewClassStudentsInfo';

const styles = theme => ({
    card: {
        minWidth: 800,
        minHeight: 500,
        marginTop: 50,
        marginBottom: 10,
        marginLeft: 50,
        marginRight: 50,
        paddingBottom: 50,
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

class ClassListStudent extends React.Component {
    state = {expanded: null, expandedEnroll: null}

    componentDidMount() {
        setInterval(async () => {
            const enrolled = await conn.call("get_enrolled_class")
            store.dispatch({
                type: "get_enrolled_class",
                result: enrolled.result
            })
        }, 3000)
    }

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

    isStarting(owner, class_name) {
        return this.props.startedClass.find(obj => (obj.owner === owner && obj.class_name === class_name)) !== undefined
    }

    render() {
        const { classes, self, ...other } = this.props
        const { expandedEnroll } = this.state
        return (
            <Card className={classes.card}>
                <CardHeader //this height is 74px
                    title={"Class List"}
                    subheader={"see your enrolled class here"}
                />
                <Grid
                    container
                    direction="row"
                    justify="space-evenly"
                >
                    <Grid item>
                        <EnrollClass {...other}/>
                    </Grid>
                </Grid>

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
                            (en.owner !== self) &&
                            <ExpansionPanel key={index} expanded={expandedEnroll === index} onChange={this.handleChangeEnroll(index)}>
                                <ExpansionPanelSummary expandIcon={<ExpandMore />}>
                                    <Typography className={classes.expand_heading}>{en.class_name} (teacher: {en.owner})</Typography>
                                    <div>
                                        {this.isStarting(en.owner, en.class_name) ?
                                            <Typography className={classes.expand_secondaryHeading_green}>
                                                Status: Starting
                                            </Typography> :
                                            <Typography className={classes.expand_secondaryHeading}>
                                                Status: Not started
                                            </Typography>
                                        }
                                        <Typography className={classes.expand_secondaryHeading}>
                                            Participants Number: {en.joined_number}/{en.sub_number}
                                        </Typography>
                                    </div>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    {/*Should not join a not started class*/}
                                    <Button variant="outlined"
                                            onClick={() => this.joinClass(en.owner, en.class_name)}
                                            disabled={!this.isStarting(en.owner, en.class_name)}
                                    >Enter</Button>
                                    <ViewClassStudentsInfo 
                                        class={{owner: en.owner, class_name: en.class_name}} {...other}/>
                                    <Button variant="outlined"><Settings/></Button>
                                </ExpansionPanelDetails>
                            </ExpansionPanel>
                        )) :
                        <Typography variant="body1">No Enrolled Class</Typography>
                }
                </div>
            </Card>
        )
    }
}

ClassListStudent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ClassListStudent);