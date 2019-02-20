import React from 'react';
// import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Divider, Grid, Typography} from '@material-ui/core'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';
import Dropzone from 'react-dropzone'
import classNames from 'classnames'
import {connection as conn, uploadURL} from '../../interface/connection'
import {withCookies} from 'react-cookie'
import {compose} from 'redux'
import RndContainer from './RndContainer';
import { FileDownload } from '@material-ui/icons';
import ShareBrn from './ShareBtn'
import ViewButton from './ViewButton'

const styles = theme => ({
    card: {
        width: 450,
        height: 550
    },
    griditems: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    root: {
        flexGrow: 1,
        maxWidth: 752,
    },
    demo: {
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        margin: `${theme.spacing.unit * 4}px 0 ${theme.spacing.unit * 2}px`,
    },
    infolist: {
        width: 450,
        height: 150
    },
    listItem: {
        width: 285, // 270
        overflow: "hidden",
        // whiteSpace: "nowrap",
        // textOverflow: "ellipsis"
    },
    dropzone: {

    },
})

class Drawer extends React.Component {
    state = {
        // files: [{name: "file1.pdf", time: "4/2/2019 15:01"}, {name: "file2.jpg", time: "4/2/2019 15:30"}],
        files: [],
        dense: false,
    }
    
    async componentDidMount() {
        const response = await conn.call("get_filenames_in_drawer")
        if (response.result) this.setState({files: response.result})
        conn.addListener('drawer_item_change', this.handleDrawerChange)
    }

    handleDrawerChange = e => {
        this.setState({files: e.result}, () => {
            this.props.handleNotification(`Received file from ${e.from}`)
        })
    }

    // handleDrag = (filename) => {
    //     const username = this.props.cookies.get("name")
    //     const password = this.props.cookies.get("password")
        // fetch(uploadURL+`/download/${username}/${password}/${filename}`)
        // .then(response => response.text())
        // .then(data => console.log(data))
        // .catch(e => {this.props.handleNotification(`${e}`)})
    // }
    
    handleDownload = filename => {
        const username = this.props.cookies.get("name")
        const password = this.props.cookies.get("password")
        window.open(uploadURL+`/download/${username}/${password}/${filename}`)
    }

    handleDelete = async filename => {
        const response = await conn.call("file_delete", {filename})
        if (response) {
            if (response.result === "ok") {
                this.setState({files: response.files})
                this.props.handleNotification(`Delete file ${filename} success`)
            } else {this.props.handleNotification(`Delete file error: Invalid response`)}
        } else {this.props.handleNotification(`Internal server error: Delete file failed`)}
    }

    handleDrop = (acceptedFiles, rejectedFiles) => {
        if (acceptedFiles.length > 0){
            let formdata = new FormData()
            formdata.append("data", acceptedFiles[0], acceptedFiles[0].name) //3rd arg refer to filename
            formdata.append("timestamp", (new Date()).toISOString())
            formdata.append("username", this.props.cookies.get("name"))
            formdata.append("password", this.props.cookies.get("password"))
            fetch(uploadURL+'/upload', {
                method: "POST",
                body: formdata
            })
            .then(response => response.text())
            .then(data => this.props.handleNotification(data))
            .catch(e => {this.props.handleNotification(`${e}`)})
        }
    }

    breakFilenameToLines(filename) {
        const len = 21
        if (filename.length > len) {
            return filename.substr(0, len) + ' ' + filename.substr(len)
        }
        return filename
    }

    render() {
        const {classes, ...other} = this.props;
        const { dense } = this.state;
        return (
            <RndContainer 
                {...other}
            >   
                <Card className={classes.card}>
                <CardHeader //this height is 74px
                    title= "Personal Drawer"
                    id={`draggable${this.props.id}`}
                />
                    <Divider/>
                    <Grid 
                        container 
                        direction="column"
                        justify="center"
                        alignItems="flex-start"
                    >
                        <Grid item xs={12} md={6}>
                            <div className={classes.demo}>
                                <List dense={dense} className={classes.infolist}>
                                    {this.state.files &&
                                    this.state.files.map(filename => 
                                    <ListItem key={filename} className={classes.listItem}>
                                        <ListItemAvatar>
                                            <Avatar>
                                                <FolderIcon />
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText primary={this.breakFilenameToLines(filename)}/>
                                        <ListItemSecondaryAction>
                                        <ViewButton 
                                            {...other} 
                                            filename={filename}
                                            username={this.props.cookies.get("name")}
                                            password={this.props.cookies.get("password")}
                                            />
                                        <ShareBrn {...other} filename={filename}/>
                                        <IconButton aria-label="Download" onClick={() => this.handleDownload(filename)}>
                                            <FileDownload />
                                        </IconButton>
                                        <IconButton aria-label="Delete" onClick={() => this.handleDelete(filename)}>
                                            <DeleteIcon />
                                        </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    )}
                                    <ListItem className={classes.dropzone}>
                                        <Dropzone onDrop={this.handleDrop}>
                                            {({ getRootProps, getInputProps, isDragActive }) => {
                                                return (
                                                    <div
                                                        {...getRootProps()}
                                                        className={classNames("dropzone", { "dropzone--isActive": isDragActive })}
                                                    >
                                                        <input {...getInputProps()} />
                                                        {
                                                            isDragActive ?
                                                                <p>Drop files here... (50MB max)</p> :
                                                                <p>Drop files here, or click to select files to upload (50MB max)</p>
                                                        }
                                                    </div>
                                                )
                                            }}
                                        </Dropzone>
                                    </ListItem>
                                </List>
                            </div>
                        </Grid>
                    </Grid>
                </Card>
            </RndContainer>
        )
    }
}

export default compose(
    withCookies,
    withStyles(styles, {withTheme: true}),
)(Drawer)