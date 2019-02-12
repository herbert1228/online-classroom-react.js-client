import React from 'react';
import {Rnd} from 'react-rnd'
import {withStyles} from '@material-ui/core/styles'

const styles = theme => ({})

class RndContainer extends React.Component {
    render() {
        const { children, zIndex, id,
                position, size, enableResizing, minWidth,
                lockAspectRatio, lockAspectRatioExtraHeight 
        } = this.props
        return (
            <Rnd 
                style={{zIndex: zIndex}} 
                default={{...size, ...position}}
                onMouseDown={() => this.props.bringTop()}
                onDragStart={() => this.props.bringTop()}
                lockAspectRatio={lockAspectRatio || false}
                enableResizing={enableResizing || true}
                lockAspectRatioExtraHeight={lockAspectRatioExtraHeight || 0}
                bounds="window"
                minWidth={minWidth || 200}
                dragHandleClassName={
                    document.getElementById(`draggable${id}`)?
                    document.getElementById(`draggable${id}`).className : null
                }
                ref={el => this.props.inputRef(id, el)}
            >
                {children}
            </Rnd>
        )
    }
}

export default withStyles(styles)(RndContainer);