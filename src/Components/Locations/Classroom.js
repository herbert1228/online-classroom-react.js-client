import React, {Fragment} from 'react';
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Button } from '@material-ui/core'
import JoinedLayoutStudent from '../Classroom_Components/JoinedLayoutStudent'
import JoinedLayoutTeacher from '../Classroom_Components/JoinedLayoutTeacher'

const styles = theme => ({
    notJoined: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translateX(-55%) translateY(-60%)'
    },
    btn_notJoinged: {
        marginLeft: 35
    }
})

class Classroom extends React.Component {
    render() {
        const { classes, ...other } = this.props
        return (
            <Fragment>
                {(this.props.joined == null) && 
                    <div className={classes.notJoined}>
                        <Typography variant="headline" gutterBottom>
                            Not joined a classroom yet
                        </Typography>
                        <Button 
                            className={classes.btn_notJoinged}
                            onClick={() => this.props.changeScene(2.2)}
                            size="small">
                        Select a classroom here!</Button>
                    </div>
                }
                {(this.props.joined) && (this.props.joined.owner !== this.props.self) &&
                   <JoinedLayoutStudent {...other}/>
                }
                {(this.props.joined) && (this.props.joined.owner === this.props.self) &&
                   <JoinedLayoutTeacher {...other}/>
                }
            </Fragment>
        )
    }
}

Classroom.propTypes = {
    classes: PropTypes.object.isRequired,
}

export default withStyles(styles)(Classroom)