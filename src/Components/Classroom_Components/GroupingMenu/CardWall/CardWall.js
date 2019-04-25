import React from 'react'
import PropTypes from 'prop-types'
import { findDOMNode } from 'react-dom'
import { DropTarget } from 'react-dnd'

import Card from '../Card'

const dropTarget = {
  canDrop(props, monitor) {
    // You can disallow drop based on props or item
    const item = monitor.getItem()
    const { status: wallStatus } = props
    const { status: cardStatus } = item

    return wallStatus !== cardStatus
  },

  hover(props, monitor, component) {
    // This is fired very often and lets you perform side effects
    // in response to the hover. You can't handle enter and leave
    // here—if you need them, put monitor.isOver() into collect() so you
    // can just use componentWillReceiveProps() to handle enter/leave.

    // You can access the coordinates if you need them
    const clientOffset = monitor.getClientOffset()
    const componentRect = findDOMNode(component).getBoundingClientRect()

    // You can check whether we're over a nested drop target
    const isJustOverThisOne = monitor.isOver({ shallow: true })

    // You will receive hover() even for items for which canDrop() is false
    const canDrop = monitor.canDrop()
  },
  drop(props, monitor, component) {
    if (monitor.didDrop()) {
      // If you want, you can check whether some nested
      // target already handled drop
      return true
    }

    // Obtain the dragged item
    // You can do something with it
    const item = monitor.getItem()
    console.log('dropCard:', item)
    console.log('dropWall', props)
    const { id } = item
    const { updateCardStatus, status: targetStatus } = props
    updateCardStatus(id, targetStatus)

    // You can also do nothing and return a drop result,
    // which will be available as monitor.getDropResult()
    // in the drag source's endDrag() method
    return { moved: true }
  },
}

const dropCollect = (connect, monitor) => ({
  // Call this function inside render()
  // to let React DnD handle the drag events:
  connectDropTarget: connect.dropTarget(),
  // You can ask the monitor about the current drag state:
  isOver: monitor.isOver(),
  isOverCurrent: monitor.isOver({ shallow: true }),
  canDrop: monitor.canDrop(),
  itemType: monitor.getItemType(),
})

class CardWall extends React.Component {
  componentWillReceiveProps(nextProps) {
    const { isOver, isOverCurrent } = this.props
    if (!isOver && nextProps.isOver) {
      // You can use this as enter handler
    }

    if (isOver && !nextProps.isOver) {
      // You can use this as leave handler
    }

    if (isOverCurrent && !nextProps.isOverCurrent) {
      // You can be more specific and track enter/leave
      // shallowly, not including nested targets
    }
  }

  render() {
    const {
      children,
      status,
      isOver, // Injected by React DnD
      canDrop, // Injected by React DnD
      connectDropTarget, // Injected by React DnD
    } = this.props

    return connectDropTarget(
      <div className='card-wall'>
        <div className='card-wall-wrapper'>
          <p>{ status }</p>
          <div className='card-wall-content'>
            { children }
            { isOver && canDrop && <Card empty /> }
          </div>
        </div>
      </div>
    )
  }
}

CardWall.propTypes = {
  children: PropTypes.node,
  status: PropTypes.string.isRequired,

  // Injected by React DnD
  connectDropTarget: PropTypes.func,
  isOver: PropTypes.bool,
  isOverCurrent: PropTypes.bool,
  canDrop: PropTypes.bool,
  itemType: PropTypes.string,
}

CardWall.defaultProps = {
}

export default DropTarget('CONNECT_CARD', dropTarget, dropCollect)(CardWall)
