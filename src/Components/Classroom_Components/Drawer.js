import React from 'react';
// import PropTypes from 'prop-types'
import {withStyles} from '@material-ui/core/styles'
import {Card, CardHeader, Divider, Grid} from '@material-ui/core'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import FolderIcon from '@material-ui/icons/Folder';
import DeleteIcon from '@material-ui/icons/Delete';


const styles = theme => ({
    card: {
        width: 450,
        height: 550
    },
    griditems: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    newitems: {
        display: 'flex',
    },
    infodiv: {
        padding: '10px'
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
      }
});

class Drawer extends React.Component {
    state = {
        files: [{name: "file1.pdf", time: "4/2/2019 15:01"}, {name: "file2.jpg", time: "4/2/2019 15:30"}],
        dense: false,
    }
    
// componentDidMount() {
// }

    render() {
        const {self} = this.props;
        const {classes, ...other} = this.props;
        const { dense, secondary } = this.state;
        return (  
            <Card className={classes.card}>
            <CardHeader //this height is 74px
                title= "Personal Drawer"
            />
                <Divider/>
                <Grid 
                    container 
                    direction="column"
                    justify="center"
                    alignItems="start"
                >
                    
                    {/* {this.state.files.map(file => 
                        <Grid item className={classes.griditems}>
                        <div className={classes.infodiv}>
                            <text>{file.name}</text>
                        </div>
                        <div className={classes.infodiv}>
                            <text>{file.time}</text>
                        </div>
                            <div className={classes.infodiv}>
                                <button>View</button>
                                <button>Delete</button>
                                <button>Share</button>
                            </div>
                        </Grid>
                    )}
                        <Grid item className={classes.newitem}>
                            <div className={classes.infodiv}>
                                <button> + </button>
                                <text>Upload/Drag</text>
                            </div>
                        </Grid> */}

        <Grid item xs={12} md={6}>
            <div className={classes.demo}>
              <List dense={dense} className={classes.infolist}>
                {this.state.files.map(file => 
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>
                        <FolderIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                        primary={file.name}
                    />
                    <ListItemText
                        primary={file.time}
                    />
                    <ListItemSecondaryAction>
                      <IconButton aria-label="Delete">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>,
                )}
              </List>
            </div>
        </Grid>
                </Grid>
            </Card>
        );
    }
}

export default withStyles(styles)(Drawer)