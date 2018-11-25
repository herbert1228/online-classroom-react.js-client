import { v4 } from 'uuid';

export const TOOL_PENCIL = 'pencil';

export default (props) => {
    let stroke = null;

    const onMouseDown = (x, y, color, size) => {
        stroke = {
            id: v4(),
            tool: TOOL_PENCIL,
            color,
            size,
            points: [{ x, y }]
        };
        return stroke;
    };

    const drawLine = (item, start, { x, y }) => {
        props.lineJoin = 'round';
        props.lineCap = 'round';
        props.beginPath();
        props.lineWidth = item.size;
        props.strokeStyle = item.color;
        props.globalCompositeOperation = 'source-over'; //or 'destination-over'
        props.moveTo(start.x, start.y);
        props.lineTo(x, y);
        props.closePath();
        props.stroke();
    };

    const onMouseMove = (x, y) => {
        if (!stroke) return [];
        const newPoint = { x, y };
        const start = stroke.points.slice(-1)[0];
        drawLine(stroke, start, newPoint);
        stroke.points.push(newPoint);
        // return [stroke];
    };

    const onMouseUp = (x, y) => {
        if (!stroke) return;
        onMouseMove(x, y);
        const item = stroke;
        stroke = null;
        return item;
    };

    const draw = (item, animated) => {
        let time = 0;
        let i = 0;
        const j = item.points.length;
        for (i, j; i < j; i++) {
            if (!item.points[i - 1]) continue;
            if (animated) {
                setTimeout(drawLine.bind(null, item, item.points[i - 1], item.points[i]), time);
                time += 10;
            } else {
                drawLine(item, item.points[i - 1], item.points[i]);
            }
        }
    };

    return {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        draw,
    };
}
