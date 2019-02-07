let websocket
const TIMEOUT = 5000
const callsInProgress = {}

const url = `ws://${window.location.hostname}:8500/`
// const url = "ws://overcoded.tk:8500"

function genid() {
    // https://stackoverflow.com/a/2117523
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c === 'x' ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        })
    }
    return uuidv4()
}

const listener = {
    listener: {},
    addListener(type, callback) {
        if (!listener[type]) {
            listener[type] = []
        }
        listener[type].push(callback)
    },
    removeListener(type, callback) {
        if (listener[type]) {
            let i = listener[type].indexOf(callback)
            listener[type].slice(i, 1)
        }
    },
    emit(type, params) {
        if (listener[type]) {
            for (let callback of listener[type]) {
                callback(params)
            }
        }
    }
}

// PLEASE DELETE THIS AFTER DEBUGGING
var DEBUG = false
;(function () {
    var send = WebSocket.prototype.send
    WebSocket.prototype.send = function (msg) {
        if (DEBUG) console.log("websocket sending:\n", JSON.parse(msg))
        return send.call(this, msg)
    }
})()

function sendMessage(ws, message) {
    ws.send(JSON.stringify(message))
}

function handleMessage(e) {
    const message = JSON.parse(e.data)
    if (DEBUG) console.log("websocket received:\n", message)

    if (message[0] === "reply") {
        // eslint-disable-next-line
        const [_messageType, id, reply] = message
        if (callsInProgress[id]) {
            callsInProgress[id](reply)
            callsInProgress[id] = null
        } else {
            console.log(callsInProgress[id])
            throw new Error("unrecognized call id")
        }
    }else if (message[0] === "event") {
        // eslint-disable-next-line
        const [_messageType, type, params] = message
        listener.emit(type, params)
    } else {
        throw new Error("unrecognized message type")
    }
}

const connection = {
    connect() {
        websocket = new WebSocket(url)
        websocket.onmessage = handleMessage
        websocket.onerror = (e) => console.log(e)
        websocket.onopen = () => listener.emit("socketopen", null)
        websocket.onclose = () => listener.emit("socketclose", null)
    },
    cast(type, params) {
        sendMessage(websocket, ["cast", type, params])
    },
    call(type, params) {
        let id = genid()
        sendMessage(websocket, ["call", id, type, params])

        return new Promise((resolve, reject) => {
            callsInProgress[id] = resolve
            setTimeout(
                () => reject(new Error(`call timeout, type: ${type}, params: ${params}`)),
                TIMEOUT
            )
        })
    },
    addListener(type, callback) {
        listener.addListener(type, callback)
    },
    removeListener(type, callback) {
        listener.removeListener(type, callback)
    },
    signalCast(type, params) {
        sendMessage(websocket, ["signal_cast", type, params])
    }
}

const signalingChannel = {
    createOffer() {

    },
    broadcast(message) {
        console.log('Local sending message: ', message.type)
        connection.cast("class_broadcast_message", message)
    },
    sendTo(message, to) {
        console.log(`Local sending message to ${to}: `, message.type)
        message.to = to
        connection.signalCast("class_direct_message", message)
    },
    sendCandidate(stream_owner, candidate, to) {
        console.log(`Sending candidate to ${to}: `, candidate.type)
        connection.signalCast("candidate", {stream_owner, candidate, to})
    },
    listenRequestOffer(callback) {
        listener.addListener("request_offer", callback)
    },
    gotUserMedia() {
        connection.signalCast("got_media", null)
    }
}

export {
    connection,
    signalingChannel
}