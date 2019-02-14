import React from 'react';
import {withStyles} from '@material-ui/core/styles'
import {Image} from 'react-konva'

const styles = theme => ({
})

class CanvasInsideWhiteboard extends React.Component {
    ctx = null
    state = {
        canvas: null
    }

    componentDidMount() {
        const canvas = document.createElement('canvas')
        canvas.width = 400
        canvas.height = 600
        this.ctx = canvas.getContext('2d')
        this.ctx.strokeStyle = '#000000'
        this.ctx.lineJoin = 'round'
        this.ctx.lineWidth = 5
        this.setState({canvas})
    }

    render() {
        return (
            <Image
                x={400}
                y={0}
                image={this.state.canvas}
                stroke={"green"}
                shadowBlur={5}
            />
        )
    }
}

export default withStyles(styles)(CanvasInsideWhiteboard);