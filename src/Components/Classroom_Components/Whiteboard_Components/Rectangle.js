import React from 'react'
import { Rect } from 'react-konva'

export default function Rectangle(props) {
    return (
        <Rect
            x={props.x}
            y={props.y}
            width={props.width}
            height={props.height}
            fill={props.fill}
            name={props.name}
            rotation={props.rotation}
            scaleX={props.scaleX}
            scaleY={props.scaleY}
            onDragEnd={e => props.onDragEnd(e)}
            onTransformEnd={e => props.onTransformEnd(e)}
            draggable
        />
    )
}