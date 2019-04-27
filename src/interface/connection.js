let websocket
const TIMEOUT = 5000
const callsInProgress = {}

// const url = `ws://${window.location.hostname}:8500/`
const url = window.SERVER_URL

// const uploadURL = `http://${window.location.hostname}:8600`
const uploadURL = window.UPLOAD_URL

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
        if (!this.listener[type]) {
            this.listener[type] = []
        }
        this.listener[type].push(callback)
    },
    removeListener(type, callback) {
        if (this.listener[type]) {
            // console.warn(this.listener)
            // console.warn("Removing listener:", type)
            let i = this.listener[type].indexOf(callback)
            this.listener[type].splice(i, 1)
            // console.warn(this.listener)
        } else {
            console.warn("Cannot find listener", type, callback)
        }
    },
    emit(type, params) {
        if (this.listener[type]) {
            for (let callback of this.listener[type]) {
                // console.warn("emitting callback for type:", type)
                // console.warn(callback)
                callback(params)
            }
        }
    }
}

window.l = listener

// PLEASE DELETE THIS AFTER DEBUGGING
var DEBUG = false
;(function () {
    var send = WebSocket.prototype.send
    WebSocket.prototype.send = function (msg) {
        if (!DEBUG) return send.call(this, msg)
        if (JSON.parse(msg) === "keep_alive") return send.call(this, msg)
        
        console.log("websocket sending:\n", JSON.parse(msg))
        return send.call(this, msg)
    }
})()

function sendMessage(ws, message) {
    if (ws.readyState === ws.OPEN)
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
        websocket.onopen = () => {
            listener.emit("socketopen", null)
            setTimeout(
                () => setInterval(() => sendMessage(websocket, "keep_alive"), 3000), 
            1000)
        }
        websocket.onclose = () => listener.emit("socketclose", null)
    },
    connected() {
        return websocket? (websocket.readyState === websocket.OPEN) : false
    },
    cast(type, params, serverType = "cast") {
        sendMessage(websocket, [serverType, type, params])
    },
    call(type, params, serverType = "call") {
        let id = genid()
        sendMessage(websocket, [serverType, id, type, params])

        return new Promise((resolve, reject) => {
            callsInProgress[id] = resolve
            setTimeout(
                // () => reject(new Error(`call timeout, type: ${type}, params: ${params}`)),
                () => reject(`call timeout, type: ${type}, params: ${params}`),
                TIMEOUT
            )
        })
    },
    addListener(type, callback) {
        listener.addListener(type, callback)
    },
    removeListener(type, callback) {
        listener.removeListener(type, callback)
    }
}

const SignalingChannel = {
    cast(type, params) {
        connection.cast(type, params, "signal_cast")
    },
    call(type, params) {
        return connection.call(type, params, "signal_call")
    },
    // broadcast(message) {
    //     console.log('Local sending message: ', message.type)
    //     connection.cast("class_broadcast_message", message)
    // },
    requestOffer(to) {
        console.log(`Sending request offer to ${to}: `)        
        this.cast("request_offer", to)
    },
    sendOffer(stream_owner, offer, to) {
        console.log(`Sending offer to ${to}: `, offer.type)
        this.cast("offer", {stream_owner, offer, to})
    },
    sendAnswer(stream_owner, answer, to) {
        console.log(`Sending answer to ${to}: `, answer.type)
        this.cast("answer", {stream_owner, answer, to})
    },
    sendCandidate(stream_owner, candidate, to) {
        console.log(`Sending candidate to ${to}: `)
        this.cast("candidate", {stream_owner, candidate, to})
    },
    gotUserMedia() {
        this.cast("got_media", null)
    },
    broadcastAction(action) {
        console.log(`Broadcasting action:`, action)
        this.cast("action", action)
    },

    // non-signaling
    getPermission() {
        this.call("get_permission", null)
    }
}

const WhiteboardChannel = { // use owner as target
    cast(type, params) {
        connection.cast(type, params, "whiteboard_cast")
    },
    call(type, params) {
        return connection.call(type, params, "whiteboard_call")
    },
    start() {
        return this.call("start", null)
    },
    connect(target) {
        return this.call("connect", target)
    },
    disconnect(target) {
        this.cast("disconnect", target)
    },
    draw(target, lines) {
        this.cast("draw", {target, lines})
    },
    onReceiveDraw(target, callback) {
        connection.addListener("whiteboard_draw_" + target, callback)
    },
    removeListener(target, callback) {
        connection.removeListener("whiteboard_draw_" + target, callback)
    }
}

const GroupWhiteboardChannel = { // use {class_name, group}} as target
    cast(type, params) {
        connection.cast(type, params, "group_whiteboard_cast")
    },
    call(type, params) {
        return connection.call(type, params, "group_whiteboard_call")
    },
    start() {
        return this.call("start", null)
    },
    connect(target) {
        return this.call("connect", target)
    },
    disconnect(target) {
        this.cast("disconnect", target)
    },
    draw(target, lines) {
        this.cast("draw", {target, lines})
    },
    onReceiveDraw(target, callback) {
        connection.addListener("group_whiteboard_draw_" + target, callback)
    },
    removeListener(target, callback) {
        connection.removeListener("group_whiteboard_draw_" + target, callback)
    }
}

const ClassStatusChannel = { // use owner as target
    cast(type, params) {
        connection.cast(type, params, "class_status_cast")
    },
    call(type, params) {
        return connection.call(type, params, "class_status_call")
    },
    async changeGroup(student, group) {
        return await this.call("change_group", {student, group})
    },
    async getGroups() { // list of groups
        return await this.call("get_groups", null)
    },
    onGroupStatusChange(callback) {
        connection.addListener("group_status_change", callback)
    },
    removeListener(callback) {
        connection.removeListener("group_status_change", callback)
    }
}

function checkTURNServer(turnConfig, timeout){ 

    return new Promise(function(resolve, reject){
  
      setTimeout(function(){
          if(promiseResolved) return;
          resolve(false);
          promiseResolved = true;
      }, timeout || 5000);
  
      var promiseResolved = false
        , myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection   //compatibility for firefox and chrome
        , pc = new myPeerConnection({iceServers:[turnConfig]})
        , noop = function(){};
      pc.createDataChannel("");    //create a bogus data channel
      pc.createOffer(function(sdp){
        if(sdp.sdp.indexOf('typ relay') > -1){ // sometimes sdp contains the ice candidates...
          promiseResolved = true;
          resolve(true);
        }
        pc.setLocalDescription(sdp, noop, noop);
      }, noop);    // create offer and set local description
      pc.onicecandidate = function(ice){  //listen for candidate events
        if(promiseResolved || !ice || !ice.candidate || !ice.candidate.candidate || !(ice.candidate.candidate.indexOf('typ relay')>-1))  return;
        promiseResolved = true;
        resolve(true);
      };
    });   
  }

export {
    connection,
    SignalingChannel,
    checkTURNServer,
    WhiteboardChannel,
    GroupWhiteboardChannel,
    ClassStatusChannel,
    uploadURL,
    genid
    // listener // for debug use
}