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
            onDragEnd={e => props.onDragEnd(e)}
            draggable
        />
    )
}