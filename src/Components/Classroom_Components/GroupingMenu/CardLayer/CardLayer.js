import React from 'react'
// import PropTypes from 'prop-types'
import { DragLayer } from 'react-dnd'

const layerStyles = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 100,
  left: 0,
  top: 0,
  width: '100%',
  height: '100%',
}

const snapToGrid = (x, y) => {
  const snappedX = Math.round(x / 32) * 32
  const snappedY = Math.round(y / 32) * 32
  return [snappedX, snappedY]
}

const getItemStyles = (props) => {
  const { initialOffset, currentOffset } = props
  if (!initialOffset || !currentOffset) {
    return {
      display: 'none',
    }
  }

  let { x, y } = currentOffset

  if (props.snapToGrid) {
    x -= initialOffset.x
    y -= initialOffset.y
    [x, y] = snapToGrid(x, y)
    x += initialOffset.x
    y += initialOffset.y
  }

  const transform = `translate(${x}px, ${y}px) rotate(5deg)`
  return {
    transform,
    WebkitTransform: transform,
  }
}

const LayerCollect = monitor => ({
  item: monitor.getItem(),
  itemType: monitor.getItemType(),
  initialOffset: monitor.getInitialSourceClientOffset(),
  currentOffset: monitor.getSourceClientOffset(),
  isDragging: monitor.isDragging()
})

const CardLayer = (props) => {
  const { item, itemType, isDragging } = props
  if (!isDragging) {
    return null
  }

  return (
    <div className='card-layer' style={layerStyles}>
      <div className='card' style={getItemStyles(props)}>{ item.name }</div>
    </div>
  )
}


CardLayer.propTypes = {
}

CardLayer.defaultProps = {
}

export default DragLayer(LayerCollect)(CardLayer)
