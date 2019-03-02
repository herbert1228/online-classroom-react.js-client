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
                // TODO need physically click the card header to handle blur problem
                // onDragStop={() => {
                //     setTimeout(() => {
                //         let {x, y} = document.getElementById(`draggable${id}`).getBoundingClientRect()
                //         x += 10
                //         y += 10
                //         console.log("clicking", x, y)
                //         const ev = new MouseEvent('click', {
                //             'view': window,
                //             'bubbles': true,
                //             'cancelable': true,
                //             screenX: x,
                //             screenY: y
                //         })
                //         const el = document.elementFromPoint(x, y)
                //         el.dispatchEventev
                //     }, 2000)
                // }}
                lockAspectRatio={lockAspectRatio || false}
                enableResizing={(enableResizing === false)?  {} : {
                    bottom: true, bottomLeft: true, bottomRight: true,
                    left: true, right: true,
                    top: true, topLeft: true, topRight: true
                }}
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