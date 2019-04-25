import React from 'react'
import PropTypes from 'prop-types'
import { DragSource } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

const dragSource = {
  beginDrag(props) {
    return {
      ...props,
    }
  }
}

function dragCollect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging()
  }
}

class Card extends React.Component {
  componentDidMount() {
    const { connectDragPreview } = this.props
    if (connectDragPreview) {
      // Use empty image as a drag preview so browsers don't draw it
      // and we can draw whatever we want on the custom drag layer instead.
      connectDragPreview(getEmptyImage(), {
        // IE fallback: specify that we'd rather screenshot the node
        // when it already knows it's being dragged so we can hide it with CSS.
        captureDraggingState: true,
      })
    }
  }

  render() {
    const {
      name,
      empty,
      isDragging, // Injected by React DnD
      connectDragPreview, // Injected by React DnD
      connectDragSource, // Injected by React DnD
    } = this.props


    return connectDragSource(
      <div
        className={`card ${ empty ? 'empty-card' : '' }`}
        style={{
          opacity: isDragging ? 0.6 : 1,
          cursor: isDragging ? 'grabbing' : 'pointer',
        }}
      >
        <span>{ name }</span>
      </div>
    )
  }
}

Card.propTypes = {
  name: PropTypes.string,
  empty: PropTypes.bool,

  // Injected by React DnD
  isDragging: PropTypes.bool.isRequired,
  connectDragSource: PropTypes.func.isRequired,
}

Card.defaultProps = {
}

export default DragSource('CONNECT_CARD', dragSource, dragCollect)(Card)
